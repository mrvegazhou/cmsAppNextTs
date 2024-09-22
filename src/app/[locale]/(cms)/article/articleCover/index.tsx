'use client';
import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import type { IData, IImageState, IUploadImageResp, IUploadImages } from '@/interfaces';
import { useAtom, useAtomValue } from 'jotai'
import { canEditAtom, writeArticleAtom } from "@/store/articleData";
import type { TBody } from '@/types';
import { uploadImages } from "@/services/api";
import LoaderComp from '@/components/loader/loader';
import useUploadImg from "@/hooks/useUploadImg";
import styles from './index.module.scss'
import classNames from "classnames";
import { initCoverImage } from "@/store/articleData";
import { isNullOrUnDef } from "@/lib/is";

const ArticleCover = (props:{init: boolean}) => {
    const t = useTranslations('ArticleEditPage');
    const [articleData, setArticleData] = useAtom(writeArticleAtom);

    const canEdit = useAtomValue(canEditAtom);

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

    const uploadArticleCoverMutation = useMutation({
        mutationFn: async (variables: TBody<IUploadImages>) => {
            return (await uploadImages(variables)) as IData<IUploadImageResp>;
        },
    });

    const fileUploadRef = useRef<HTMLInputElement | null>(null);
    const {
        imgs,
        setImgs,
        delImg,
        uploadImgMutation,
        onFileUpload
    } = useUploadImg({
        fileUploadRef: fileUploadRef, 
        type: 2,
        size: 100,
        limitStr: t('imageUploadLimit'),
        uploadErrStr: t('imageUploadErr'),
        deleteErrStr: t('imageDeleteErr')
    });

    const fileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canEdit) return;
        setImgs([]);
        // 相同的图片不用上传
        let resImgState = await onFileUpload(e);
        // 如果存在已经上传的就返回空
        console.log(resImgState, "---resImgState--");
        
        if (!isNullOrUnDef(resImgState)) setImgState(resImgState!);
    }, [canEdit]);

    const deleteCoverUrl = (id: number, imgName: string) => {
        setArticleData( prev => {
            return {...prev, coverImage: initCoverImage};
        });
        setImgState(initState);
        delImg(0, id, imgName);
    };

    return (
        <>
                {imgState.image.src ? (
                    <div className={styles.addCoverImg}>
                        <img className={styles.img} src={imgState.image.src} width={imgState.image.width+"px"} height={imgState.image.height+"px"} alt={imgState.image.tag} />
                        <i className="cursor-pointer iconfont icon-close fs-4 text-danger position-absolute top-0 end-0 fw-bold" onClick={()=>deleteCoverUrl(imgState.image.imgId!, imgState.image.imgName!)}></i>
                    </div>
                ) : (
                    <LoaderComp loading={uploadArticleCoverMutation.isPending} className='d-flex flex-column' style={{width:'152px'}}>
                    <label className={classNames(styles.addImgLabel, {"cursor-pointer": !imgState.image.src, "disabled cursor-not-allowed pe-none": !canEdit})}>
                        <input type="file" accept=".jpeg, .jpg, .png, .bmp" multiple={false} className="d-none" onChange={fileChange} ref={fileUploadRef} />
                        <div className={styles.addCoverImg}>
                            <svg width="14" height="14" viewBox="0 0 24 24" className="me-2" fill="currentColor">
                                <path fillRule="evenodd" d="M13.25 3.25a1.25 1.25 0 1 0-2.5 0v7.5h-7.5a1.25 1.25 0 1 0 0 2.5h7.5v7.5a1.25 1.25 0 1 0 2.5 0v-7.5h7.5a1.25 1.25 0 0 0 0-2.5h-7.5v-7.5Z" clipRule="evenodd"></path>
                            </svg>
                            {t('addCoverImage')}
                        </div>
                    </label>
                    </LoaderComp>
                )}
                <small className="text-muted mt-1">{t('imageSupportType')}</small>
        </>
    );
};

export default ArticleCover;