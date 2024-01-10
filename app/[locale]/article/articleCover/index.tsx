'use client';
import { useState, useEffect, useRef } from "react";
import { useTranslations } from 'use-intl';
import { useMutation } from '@tanstack/react-query';
import { useRecoilState } from "recoil";
import type { IData, IImageState, IArticleUploadImage } from '@/interfaces';
import { writeArticleContext } from "@/store/articleData";
import type { TBody } from '@/types';
import { BASE_URL, MAX_FILE_SIZE_IN_KB, ARTICLE_PERSONAL_IMAGE_URL } from '@/lib/constant';
import { handleDrop, convertBytesToKB, loadImage } from "@/lib/tool";
import useToast from '@/hooks/useToast';
import { uploadArticleImages } from "@/services/api";
import LoaderComp from '@/components/loader/loader';
import './index.scss';


const ArticleCover = (props:{init: boolean}) => {
    const t = useTranslations('RichEditor');
    const { show } = useToast();
    const [articleData, setArticleData] = useRecoilState(writeArticleContext);

    let initState = {
        loading: false,
        image: {},
        formData: new FormData(),
        err: null,
        uploaded: false,
    } as IImageState;

    const [imgState, setImgState] = useState<IImageState>(initState);
    
    useEffect(() => {
        // 初始化
        if (props.init) {
            if (articleData.coverImage.src!="") {
                setImgState((prev) => ({
                    ...prev,
                    image: articleData.coverImage,
                }));
            }
        }
    }, []);

    const uploadArticleCoverMutation = useMutation(
        async (variables: TBody<IArticleUploadImage>) => {
            return (await uploadArticleImages(variables)) as IData<any>;
        },
    );

    const fileUploadRef = useRef<HTMLInputElement | null>(null);
    const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (imgState.loading) return;
        handleDrop(e);

        let files = Array.from(e.target.files || []);
        setImgState((prev) => ({
            ...prev,
            loading: true
        }));
        const fd = new FormData();
        files.forEach((file: File, i: number) => {
            // 判断上传文件大小
            if ( convertBytesToKB(file.size) > MAX_FILE_SIZE_IN_KB ) {
                show({
                    type: 'DANGER',
                    message: t('imageUploadLimit') + MAX_FILE_SIZE_IN_KB + "KB",
                });
                return;
            }
            fd.append("file"+i, file);
        });

        let arrImg = await Promise.all(files.map(async (file) => {
            const src = window.URL.createObjectURL(file);
            let [img] = await loadImage(src, false);
            let radio = img.width / 150;
            let newHeight = img.height;
            let newWidth = img.width;
            if(radio>1) {
                newWidth = 150;
                newHeight = Math.floor(newHeight / radio);
            }
            return {
                src: src,
                name: file.name,
                height: newHeight,
                width: newWidth
            };
        }));
        
        if (!!fd.entries().next().value) {
            // 上传
            uploadArticleCoverMutation.mutateAsync({ 
                data: {
                    formData: fd,
                    type: 2
                }
            } as TBody<IArticleUploadImage>).then(res => {
                if(res.status==200) {
                    let src = BASE_URL + ARTICLE_PERSONAL_IMAGE_URL + res.data.imageName;
                    arrImg[0].src = src;
                    setImgState((prev) => ({
                        ...prev,
                        image: arrImg[0],
                        formData: fd,
                        loading: false
                    }));
                    // 保存到文章recoil
                    setArticleData({...articleData, ...{coverImage: arrImg[0]}});
                } else {
                    show({
                        type: 'DANGER',
                        message: t('imageUploadErr')
                    });
                }
            }).catch(err => {
                show({
                    type: 'DANGER',
                    message: t('imageUploadErr')
                });
            });
        }

        setImgState((prev) => ({
            ...prev,
            formData: fd,
            loading: false
        }));

        // @ts-ignore
        fileUploadRef.current.value = '';
        // @ts-ignore
        e.type == "change" && (e.target.reset && e.target.reset());
    };


    return (
        <>
            <LoaderComp loading={uploadArticleCoverMutation.isLoading} className='d-flex flex-column' style={{width:'152px'}}>
            <>
            <label className="add-img-label cursor-pointer">
                <input type="file" accept=".jpeg, .jpg, .png" multiple={false} className="d-none" onChange={onFileUpload} ref={fileUploadRef} />
                {imgState.image.src ? (
                    <div className="add-cover-img">
                        <img src={imgState.image.src} width={imgState.image.width} height={imgState.image.height} alt={imgState.image.tag}  />
                    </div>
                ) : (
                    <div className="add-cover-img">
                        <svg width="14" height="14" viewBox="0 0 24 24" className="me-2" fill="currentColor">
                            <path fillRule="evenodd" d="M13.25 3.25a1.25 1.25 0 1 0-2.5 0v7.5h-7.5a1.25 1.25 0 1 0 0 2.5h7.5v7.5a1.25 1.25 0 1 0 2.5 0v-7.5h7.5a1.25 1.25 0 0 0 0-2.5h-7.5v-7.5Z" clipRule="evenodd"></path>
                        </svg>
                        添加文章封面
                    </div>
                )}
            </label>
            </>
            </LoaderComp>
            <small className="text-muted mt-1">图片上传格式支持 JPEG、JPG、PNG</small>
        </>
    );
};

export default ArticleCover;