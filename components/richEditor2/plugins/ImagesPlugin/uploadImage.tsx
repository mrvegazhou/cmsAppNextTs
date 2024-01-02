import React, 
{   
    useImperativeHandle, 
    useRef, 
    useState, 
    MouseEvent, 
    forwardRef, 
    useEffect,
    ChangeEvent,
    useCallback
} from 'react';
import classNames from 'classnames';
import { useTranslations } from 'use-intl';
import useToast from '@/hooks/useToast';
import LoaderComp from '@/components/loader/loader';
import Image from 'next/image'
import { useMutation } from '@tanstack/react-query';
import { BASE_URL, IMAGE_URL, MAX_FILE_SIZE_IN_KB, ARTICLE_PERSONAL_IMAGE_URL } from '@/lib/constant';
import { handleDrop, loadImage, convertBytesToKB } from '@/lib/tool';
import { uploadArticleImages } from '@/services/api';
import type { IImageList, IImage, IData, IArticleUploadImages } from '@/interfaces';
import type { TBody } from '@/types';
import { ImagePayload } from '../../nodes/ImageNode';
import type {Position} from '../../nodes/InlineImageNode';
import { getPersonalImageList } from '@/services/api/image';


export type ImageProps = ImagePayload & { dataSrc?: string; deleteImage?: Function; fileName: string; position?: Position};

export type Props = {
    /**
     * 是否选择多图上传模式
     */
    multi?: boolean;
    inline?: boolean;
    height?: number;
    onClose: () => void;
    insertImg: (e: MouseEvent<HTMLSpanElement> | null, img: ImagePayload) => void;
};

export type State = {
    /**
     * 是否正在上传图片
     */
    loading: boolean;
    /**
     * 图片
     */
    images: Array<ImageProps>;
    /**
     * 表单数据
     */
    formData: FormData;
    /**
     * 错误
     */
    err: Error | null;
    /**
     * 是否已经上传
     */
    uploaded: boolean;
};

const IMAGE_HEIGHT = 300;

// 弹出框里添加图片信息
const ImageUploader = forwardRef((props: Props, ref) => {
    const t = useTranslations('RichEditor');
    let initState = {
        loading: false,
        images: [],
        formData: new FormData(), // 为了submit提交图片文件给后台
        err: null,
        uploaded: false,
    } as State;

    // 左边菜单选择
    const [leftMenu, setLeftMenu] = useState("local");
    const [checkedImgs, setCheckedImgs] = useState<{[id: number]:IImage}>({});
    // 图片分页
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(0);
    const [imgList, setImgList] = useState<IImage[]>([]);

    const [drop, setDrop] = useState(false);
    const fileUploadRef = useRef<HTMLInputElement | null>(null);
    const pHeight = props.height ?? IMAGE_HEIGHT;
    const { show } = useToast();

    const [imgState, setImgState] = useState<State>(initState);
    const [altText, setAltText] = useState<string>("");

    // inline 
    const [showCaption, setShowCaption] = useState(false);
    const [position, setPosition] = useState<Position>('left');
    const handleShowCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShowCaption(e.target.checked);
    };
    const handlePositionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPosition(e.target.value as Position);
    };

    // 获取图片库的列表
    const getPersonalImageListMutation = useMutation(
        async (variables: TBody<{page: number}>) => {
            return (await getPersonalImageList(variables)) as IData<IImageList>;
        },
    ); 
    const handleImageList = useCallback((pageNum: number) => {
        getPersonalImageListMutation.mutateAsync({ 
            data: {
                page: pageNum
            }
        }).then(res => {
            if (res.status==200) {
                console.log(res.data, "----s-----");
                setPage(res.data.page);
                setTotalPage(res.data.totalPage);
            }
        });
    }, [page]);

    useEffect(() => {
        setAltText("");
        // handleImageList(1);
    }, []);

    const _uploadFileByDrop = (e: React.DragEvent<HTMLDivElement>) => {
        return Array.from(e.dataTransfer.files || []);
    };
    const _uploadFileByClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        return Array.from(e.target.files || []);
    };
    // 远程图片下载
    const _uploadFileByNet = () => {
        setImgState((prev) => ({
            ...prev,
            loading: true
        }));
        let arrImgs = Object.keys(checkedImgs).map((id, idx) => {
            let image = checkedImgs[Number(id)];
            let src = BASE_URL + ARTICLE_PERSONAL_IMAGE_URL + image.name;
            return {
                src: src,
                fileName: image.tags,
                width: image.width,
                altText: '',
                height: image.height,
                position: position,
                showCaption: showCaption
            } as ImageProps;
        });
        setImgState({
            ...imgState,
            images: arrImgs,
            formData: new FormData(),
            loading: false
        });
        // 插入图片
        arrImgs.length>0 && props.insertImg(null, arrImgs[0]);
    };

    const onFileUpload = async (e: React.SyntheticEvent<Element>, drop?: boolean) => {
        if (imgState.loading) return;
        handleDrop(e);

        setDrop(false);

        let files;
        if (drop && e.type=='drop') {
            files = _uploadFileByDrop(e as React.DragEvent<HTMLDivElement>);
        } else {
            files = _uploadFileByClick(e as React.ChangeEvent<HTMLInputElement>);
        }

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
        
        let arrImgs = await Promise.all(files.map(async (file) => {
            const src = window.URL.createObjectURL(file);
            let [img] = await loadImage(src, false);
            let radio = img.height / pHeight;
            let newHeight = img.height;
            let newWidth = img.width;
            if(radio>1) {
                newWidth = Math.floor(newWidth / radio);
                newHeight = Math.floor(newHeight / radio);
            } else {
                if(newWidth<100) {
                    newWidth = 50;
                    newHeight = Math.floor(newHeight / (img.width / newWidth));
                }
            }
            return {
                src: src,
                fileName: file.name,
                height: newHeight,
                width: newWidth,
                altText: altText
            };
        }));

        setImgState((prev) => ({
            ...prev,
            images: arrImgs,
            formData: fd,
            loading: false
        }));

        // @ts-ignore
        fileUploadRef.current.value = '';
        // @ts-ignore
        e.type == "change" && (e.target.reset && e.target.reset());
        
    };

    const uploadArticleImageMutation = useMutation(
        async (variables: TBody<IArticleUploadImages>) => {
            return (await uploadArticleImages(variables)) as IData<any>;
        },
    );

    const onFileSubmit = (e: MouseEvent<HTMLSpanElement>) => {
        setImgState((prev) => ({
            ...prev,
            loading: true
        }));
        if (leftMenu=='local') {
            let formData = imgState.formData;
            const { multi } = props;        
            if (formData) {
                uploadArticleImageMutation.mutateAsync({ 
                    data: {
                        formData
                    }
                }).then(res => {
                    if(res.status==200) {
                        let arrImgs = imgState.images.map((image, i) => {
                            if(image.fileName==res.data.fileName) {
                                let src = BASE_URL + ARTICLE_PERSONAL_IMAGE_URL + res.data.imageName;
                                return {
                                    src: src,
                                    fileName: image.fileName,
                                    width: image.width,
                                    altText: altText,
                                    height: image.height,
                                    position: position,
                                    showCaption: showCaption
                                }
                            }
                        });
                        let newObj = Object.assign({}, imgState, {images: arrImgs});
                        setImgState(newObj);
                        // 插入图片
                        props.insertImg(e, newObj.images[0]);
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
        } else {
            _uploadFileByNet();
        }
        props.onClose();
    };

    const removeImage = (fileName: string | undefined) => {
        const { uploaded } = imgState;
        if (uploaded || fileName==undefined) return;
        let newFormData: FormData = imgState.formData;
        newFormData.delete(fileName);
        setImgState({
            ...imgState,
            images: imgState.images.filter(item => item.fileName !== fileName),
            formData: newFormData,
        });
        setAltText("");
    };

    useImperativeHandle(ref, () => ({
        removeImages() {
            setImgState(initState);
        }
    }))

    const uploadFileOnchange = () => {
        fileUploadRef.current?.click();
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        let name = e.target.name;
        if(name=="altText") {
            setAltText(e.target.value);
        }
    };

    // 拖拽上传
    const dragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        handleDrop(e);
        setDrop(true);
        if (imgState.loading) {
            return;
        }
    };

    const dragLeave =  (e: React.DragEvent<HTMLDivElement>) => {
        handleDrop(e);
        setDrop(false);
    };

    return (
        <div className='richEditorImageUploader'>
            <div className='d-flex'>
                <div className='col-2 d-flex flex-column align-items-left'>
                    <div onClick={()=>{setLeftMenu('local');}} className={classNames('cursor-pointer text-left ps-2 me-3 mb-3 py-1', {'active': leftMenu=='local'})}>
                        本地上传
                    </div>
                    <div onClick={()=>{setLeftMenu('local');}} className={classNames('cursor-pointer text-left ps-2 me-3 mb-3 py-1', {'active': leftMenu=='current'})}>
                        当前使用
                    </div>
                    <div onClick={()=>{setLeftMenu('net');}} className={classNames('cursor-pointer text-left ps-2 me-3 mb-3 py-1', {'active': leftMenu=='net'})}>
                        图片库
                    </div>
                </div>
                <div className="d-flex" style={{height: '220px'}}>
                    <div className="vr"></div>
                </div>
                {leftMenu=='local' && (                
                    <div className='col-9'>
                        <div className={classNames("form-group row uploadImageBlock", {"draggable": drop})}
                            onDragOver={(e) => { handleDrop(e); }}
                            onDragLeave={(e) => dragLeave(e)}
                            onDragEnter={(e) => dragEnter(e)}
                            onDrop={(e) => onFileUpload(e, true)}
                        >
                            <input
                                style={{display: 'none'}} 
                                id="image-uploader"
                                type="file"
                                accept="image/*"
                                ref={fileUploadRef}
                                multiple={props.multi}
                                onChange={onFileUpload}
                            />
                            <LoaderComp loading={imgState.loading} className="imagesWrapper">
                            <div>
                            { imgState.images.length > 0
                                ? imgState.images.map((image: ImageProps, index: number) => {
                                    return (
                                        <div className="imageBox" key={index}>
                                            <strong>
                                                <i className='iconfont icon-close cursor-pointer fs-2 text-danger position-absolute translate-middle-y top-0 end-0' 
                                                onClick={() => removeImage(image.fileName)}></i>
                                            </strong>
                                            <Image src={image.src} width={image.width} height={image.height} alt="" />
                                        </div>
                                    );
                                })
                                :
                                <div className='uploadImage' onClick={uploadFileOnchange}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M12 0C11.4477 0 11 0.447716 11 1V11H1C0.447715 11 0 11.4477 0 12C0 12.5523 0.447716 13 1 13H11V23C11 23.5523 11.4477 24 12 24C12.5523 24 13 23.5523 13 23V13H23C23.5523 13 24 12.5523 24 12C24 11.4477 23.5523 11 23 11H13V1C13 0.447715 12.5523 0 12 0Z" fill="#999999"></path>
                                    </svg>
                                </div>
                                }
                            </div>
                            </LoaderComp>
                        </div>
                        <div className="form-group row mt-3">
                            <label className="col-sm-3 col-form-label text-end">{t('imageAltText')}</label>
                            <div className="col-sm-8">
                            <input type='text' name="altText" placeholder={t('optional')} value={altText} className="form-control" onChange={handleChange}/>
                            </div>
                        </div>
                        {props.inline && (
                            <>
                            <div className="form-group row mt-3">
                                <label className="col-sm-3 col-form-label text-end">位置</label>
                                <div className="col-sm-8">
                                    <select className="form-select" aria-label="Default select example" onChange={handlePositionChange}>
                                        <option value="left">左</option>
                                        <option value="right">右</option>
                                        <option value="full">全宽</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group row mt-3">
                                <label className="col-sm-3 col-form-label text-end">是否显示标题</label>
                                <div className="col-sm-8">
                                    <input className="form-check-input" 
                                        type="checkbox"
                                        value=""
                                        checked={showCaption}
                                        onChange={handleShowCaptionChange}
                                        id="caption" />
                                </div>
                            </div>
                            </>
                        )}

                    </div>
                )}
                {leftMenu=='net' && (
                    <div className='col-9 mx-auto'>
                        <div className='d-flex flex-row flex-wrap align-items-center text-center'>
                            <LoaderComp loading={getPersonalImageListMutation.isLoading} className="imagesWrapper">
                            <>
                                {imgList.map((item, idx) => {
                                    return (
                                        <div className='img-picker-item' >
                                            <i role="img" aria-describedby="图片描述" title="图片描述" className={classNames("img-i", {"img-selected": checkedImgs[item.id]})}
                                                style={{backgroundImage: 'url("https://tse2-mm.cn.bing.net/th/id/OIP-C.g9UbVfyVZX-SfD09JcYr5QHaEK?rs=1&pid=ImgDetMain")'}}>
                                                <span className={classNames("img-checkbox", {"img-selected": checkedImgs[item.id]})}></span>
                                            </i>
                                            <strong className="img-title">2222</strong>
                                        </div>
                                    );
                                })}
                            </>
                            </LoaderComp>
                        </div>
                        <div className="img-pagination">
                            <span className="img-nav">
                                <span className="img-pageNum">
                                    <label>{page}</label> 
                                    <span>/</span> 
                                    <label>{totalPage}</label>
                                </span> 
                                <i className='iconfont icon-youjiantou img-pageBtn'></i>
                            </span> 
                            <span className="img-page-form">
                                <input type="number" className="img-page-input" /> 
                                <a href="javascript:;" className="img-page-link" onClick={() => handleImageList(page)}>跳转</a>
                            </span>
                        </div>
                    </div>
                )}
            </div>
            <div className='d-flex'>
                <div className='col-2'></div>
                <div className=''></div>
                <div className='form-row text-center mt-4 mb-3 col-9'>
                    <button disabled={imgState.loading} type="button" className="btn btn-outline-primary" onClick={onFileSubmit}>
                        {t('upload')}
                    </button>
                </div>
            </div>
            
        </div>
    );
});
ImageUploader.displayName = "ImageUploader";
export default ImageUploader;