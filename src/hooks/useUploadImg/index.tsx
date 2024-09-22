import {
    type ChangeEvent,
    useState,
    useRef,
    useCallback
} from 'react';
import { useMutation } from '@tanstack/react-query';
import {
    delImageById,
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
import { useAtom } from 'jotai'
import { writeArticleAtom } from "@/store/articleData";

interface propsType {
    fileUploadRef: React.MutableRefObject<HTMLInputElement | null>;
    type: number;
    size: number;
    limitStr: string;
    uploadErrStr: string;
    deleteErrStr: string;
}
const useUploadImg = (props: propsType) => {
    const [articleData, setArticleData] = useAtom(writeArticleAtom);

    const {
        fileUploadRef,
        type,
        size,
        limitStr,
        uploadErrStr,
        deleteErrStr
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
        imgId: 0,
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
            let radio = img.width / size;
            let newHeight = img.height;
            let newWidth = img.width;
            
            if(radio>1) {
                newWidth = size;
                newHeight = Math.floor(newHeight / radio);
                radio = newHeight / size;
                if (radio>1) {
                    newHeight = size;
                    newWidth = Math.floor(newWidth / radio);
                }
            }
            return {
                src: src,
                fileName: file.name,
                height: newHeight,
                width: newWidth,
                dataRawWidth: img.width+"",
                dataRawHeight: img.height+"",
            } as IImage;
        }));

        const exists = imgs.some((item) => {
            return item.image.fileName === arrImg[0].fileName;
        });
        if (exists) {
            imgState.loading = false;
            return;
        }

        if (!!fd.entries().next().value) {
            let datas = { formData: fd, type: type+"" };
            // 上传
            if (type==2) {
                Object.assign(datas, { resourceId: articleData.id+"" });
            }
            await uploadImgMutation.mutateAsync({ 
                data: datas
            } as TBody<IUploadImages>).then(res => {
                if(res.status==200) {
                    let src = API_URL + PERSONAL_IMAGE_URL + res.data.imageName;
                    arrImg[0].src = src;
                    arrImg[0].imgName = res.data.imageName;

                    imgState.image = arrImg[0];
                    imgState.formData = fd;
                    imgState.loading = false;
                    imgState.resourceId = res.data.resourceId;
                    imgState.image.imgId = res.data.imgId;

                    setImgs(prev => {
                        let newImgState = {...imgState};
                        console.log(newImgState, !isNullOrUnDef(newImgState) && !isNullOrUnDef(newImgState.image));
                        
                        if (!isNullOrUnDef(newImgState) && !isNullOrUnDef(newImgState.image)) {
                            return [...prev, newImgState];
                        } else {
                            return prev;
                        }
                    });
                    // 如果是文章封面
                    if (type==2) {
                        // 保存到文章recoil
                        const articleId = res.data.resourceId;
                        setArticleData({...articleData, ...{coverImage: arrImg[0], id: articleId}});
                    }
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
        mutationFn: async (variables: TBody<{id: number; imgName: string}>) => {
            return (await delImageById(variables)) as IData<IUploadImageResp>;
        },
    });

    const delImg = async (idx: number, imgId: number, imgName: string) => {
        const imgsTemp = imgs.filter((value, index) => index !== idx);
        setImgs(imgsTemp);
        await delImgMutation.mutateAsync({ 
            data: {id: imgId, imgName: imgName}
        } as TBody<{id: number; imgName: string}>).then(res => {
            if(res.status==200) {
                
            } else {
                show({
                    type: 'DANGER',
                    message: deleteErrStr,
                });
                return;
            }
        });
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