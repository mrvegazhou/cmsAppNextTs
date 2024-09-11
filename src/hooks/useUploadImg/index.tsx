import {
    type ChangeEvent,
    useState,
    useRef,
    useCallback
} from 'react';
import { useMutation } from '@tanstack/react-query';
import {
    delImageByName,
    uploadImages
} from '@/services/api';
import type {
    IData,
    IImageState,
    IUploadImages,
    IUploadImageResp,
    IImage
} from '@/interfaces';
import useToast from '@/hooks/useToast';
import type { TBody } from '@/types';
import { convertBytesToKB, handleDrop, loadImage } from "@/lib/tool";
import { API_URL, MAX_FILE_SIZE_IN_KB, PERSONAL_IMAGE_URL } from '@/lib/constant';
import { isNullOrUnDef } from '@/lib/is';

interface propsType {
    fileUploadRef: React.MutableRefObject<HTMLInputElement | null>;
    type: number;
    width: number;
    limitStr: string;
    uploadErrStr: string;
}
const useUploadImg = (props: propsType) => {
    const {
        fileUploadRef,
        type,
        width,
        limitStr,
        uploadErrStr
    } = props;
    const { show } = useToast();

    const uploadImgMutation = useMutation({
        mutationFn: async (variables: TBody<IUploadImages>) => {
            return (await uploadImages(variables)) as IData<IUploadImageResp>;
        },
    });

    let initState = {
        loading: false,
        image: {},
        formData: new FormData(),
        err: null,
        uploaded: false,
        resourceId: 0,
    } as IImageState;
    const imgStateRef = useRef<IImageState>(initState);
    const [imgs, setImgs] = useState<IImageState[]>([]);

    const onFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => { 
        let imgState = imgStateRef.current;
        
        if (imgState.loading) return;
        handleDrop(e);

        let files = Array.from(e.target.files || []);
        imgState.loading = true;
        imgState.image = {} as IImage;
        const fd = new FormData();
        files.forEach((file: File, i: number) => {
            // 判断上传文件大小
            if ( convertBytesToKB(file.size) > MAX_FILE_SIZE_IN_KB ) {
                show({
                    type: 'DANGER',
                    message: limitStr + MAX_FILE_SIZE_IN_KB + "KB",
                });
                return;
            }
            fd.append("file"+i, file);
        });

        let arrImg = await Promise.all(files.map(async (file) => {
            const src = window.URL.createObjectURL(file);
            let [img] = await loadImage(src, false);
            let radio = img.width / width;
            let newHeight = img.height;
            let newWidth = img.width;
            if(radio>1) {
                newWidth = width;
                newHeight = Math.floor(newHeight / radio);
            }
            return {
                src: src,
                fileName: file.name,
                height: newHeight,
                width: newWidth
            };
        }));

        const exists = imgs.some((item) => {
            return item.image.fileName === arrImg[0].fileName;
        });
        if (exists) {
            imgState.loading = false;
            return;
        }

        if (!!fd.entries().next().value) {
            // 上传
            await uploadImgMutation.mutateAsync({ 
                data: {
                    formData: fd,
                    type: type+"",
                }
            } as TBody<IUploadImages>).then(res => {
                if(res.status==200) {
                    let src = API_URL + PERSONAL_IMAGE_URL + res.data.imageName;
                    arrImg[0].src = src;
                    
                    imgState.image = arrImg[0];
                    imgState.formData = fd;
                    imgState.loading = false;
                    imgState.resourceId = res.data.resourceId;

                    setImgs(prev => {
                        let newImgState = {...imgState};
                        if (!isNullOrUnDef(newImgState) && !isNullOrUnDef(newImgState.image)) {
                            return [...prev, newImgState];
                        } else {
                            return prev;
                        }
                    });
                } else {
                    show({
                        type: 'DANGER',
                        message: uploadErrStr
                    });
                    imgState.image = {} as IImage;
                }
            }).catch(err => {
                show({
                    type: 'DANGER',
                    message: uploadErrStr
                });
            });
        }
        imgState.loading = false;
        // @ts-ignore
        fileUploadRef.current.value = '';
        // @ts-ignore
        e.type == "change" && (e.target.reset && e.target.reset());
        return imgState;
    }, [imgs]);

    const delImgMutation = useMutation({
        mutationFn: async (variables: TBody<{name: string}>) => {
            return (await delImageByName(variables)) as IData<IUploadImageResp>;
        },
    });

    const delImg = (idx: number) => {
        const imgsTemp = imgs.filter((value, index) => index !== idx);
        setImgs(imgsTemp);
    };
    

    return {
        imgs,
        setImgs,
        delImg,
        uploadImgMutation,
        onFileUpload,
    };
}

export default useUploadImg;