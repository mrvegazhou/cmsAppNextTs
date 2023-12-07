import React, 
{   
    useImperativeHandle, 
    useRef, 
    useState, 
    MouseEvent, 
    forwardRef, 
    useEffect,
    ChangeEvent
} from 'react';
import Image from 'next/image'
import { useMutation } from '@tanstack/react-query';
import { 
    EditorState,
    ContentBlock,
    Modifier
} from 'draft-js'
import { AddImageProps, OnChangeType } from '../../interfaces';
import classNames from 'classnames';
import useToast from '@/hooks/useToast';
import { uploadArticleImages } from '@/services/api';
import type {
    IArticleUploadImages
} from '@/interfaces';
import type { TBody } from '@/types';
import { useTranslations } from 'use-intl';
import { handleDrop, loadImage } from '@/lib/tool';
import LoaderComp from '@/components/loader/loader';
import type { IData } from '@/interfaces';
import { BASE_URL, IMAGE_URL, MAX_FILE_SIZE_IN_KB } from '@/lib/constant';
import { convertBytesToKB } from '@/lib/tool';
import { insertImage } from '../../utils/content';
import OverlayComp from '@/components/overlay/overlay';
import OverLayTriggerComp from '@/components/overlay/overlayTrigger';
import "./image.css";

type ImageProps = {
    dataURL?: string;
    url: string;
    fileName: string;
    width?: number;
    description?: string;
    height?: number;
    deleteImage?: ()=>void;
};
export interface imageToolBarProps {
    setEditorState: (editorState: EditorState) => void;
    editorState: EditorState;
    active?: boolean;
    classNames?: string;
    onClick?: () => void;
    requestFocus: Function;
    requestBlur: Function;
}
export const ImageToolBar = (props: imageToolBarProps) => {
    const t = useTranslations('RichEditor');
    const imageUploaderRef = useRef(null)
    const overLayRef = useRef(null);
    const [isOpen, setOpen] = useState(false);

    const showImageModal = () => {
        hidePop();
        setOpen(true);
        // @ts-ignore
        imageUploaderRef.current && imageUploaderRef.current.removeImages();
        props.onClick && props.onClick();
        props.requestBlur && props.requestBlur();
    };

    const onClickCloseModal = () => {
        setOpen(false);
        props.requestFocus && props.requestFocus();
    };

    const onToggle = (e: MouseEvent<HTMLSpanElement>, img: ImageProps) => {
        e.preventDefault();
        if(img!=undefined && img!=null) {
            let imgH = img.height!;
            const data = {
                dataURL: img.dataURL,
                src: img.url,
                description: img.description,
                fileName: img.fileName,
                width: img.width,
                height: imgH
            }
            // @ts-ignore
            props.setEditorState(insertImage(props.editorState, data));
        }
    };

    const hidePop = ()=>{
        // @ts-ignore
        overLayRef.current && overLayRef.current.hide();
    }

    return (
        <>
            <span onClick={showImageModal} className={classNames("cursor-pointer me-4", props.classNames)} onMouseDown={(e) => e.preventDefault()}>
                <OverLayTriggerComp ref={overLayRef} placement="top" overlay={<small className='p-1'>{t('imageUpload')}</small>}>
                    <i className='iconfont icon-ic_image_upload fs-4 text-black-50'></i>
                </OverLayTriggerComp>
            </span>

            <OverlayComp usePortal={false} onClose={()=>{setOpen(false)}} isOpen={isOpen} className='d-flex justify-content-center align-items-center'>
                <div className="bg-white mt-5 rounded-2" style={{width:"590px", top: "-200px"}}>
                    <div className="d-flex flex-row justify-content-end">
                        <a href="#" onClick={onClickCloseModal} className="close text-dark text-decoration-none px-2">
                            <i className='iconfont icon-close fs-4'></i>
                        </a>
                    </div>
                    <ImageUploader multi={false} ref={imageUploaderRef} onClose={onClickCloseModal} onToggle={onToggle} requestFocus={props.requestFocus}/>
                </div>
            </OverlayComp>
        </>
    );
};

export type Props = {
    /**
     * 是否选择多图上传模式
     */
    multi?: boolean;
    height?: number;
    onClose: () => void;
    onToggle: (e: MouseEvent<HTMLSpanElement>, img: ImageProps) => void;
    requestFocus: Function;
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
export const ImageUploader = forwardRef((props: Props, ref) => {
    const t = useTranslations('RichEditor');
    let initState = {
        loading: false,
        images: [],
        formData: new FormData(),
        err: null,
        uploaded: false,
    } as State;

    const [drop, setDrop] = useState(false);
    const fileUploadRef = useRef<HTMLInputElement | null>(null);
    const pHeight = props.height ?? IMAGE_HEIGHT;
    const { show } = useToast();

    const [imgState, setImgState] = useState<State>(initState);
    const [description, setDescription] = useState<string>("");

    useEffect(() => {
        setDescription("");
    }, []);

    const _uploadFileByDrop = (e: React.DragEvent<HTMLDivElement>) => {
        return Array.from(e.dataTransfer.files || []);
    };
    const _uploadFileByClick = (e: React.ChangeEvent<HTMLInputElement>) => {
        return Array.from(e.target.files || []);
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
            const url = window.URL.createObjectURL(file);
            let [img, dataURL] = await loadImage(url, true);
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
                dataURL: dataURL,
                url: url,
                fileName: file.name,
                height: newHeight,
                width: newWidth,
                description: description
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
                            let url = BASE_URL + IMAGE_URL + res.data.imageName;
                            return {
                                dataURL: image.dataURL,
                                url: url,
                                fileName: image.fileName,
                                width: image.width,
                                description: description,
                                height: image.height,
                            }
                        }
                    });
                    let newObj = Object.assign({}, imgState, {images: arrImgs});
                    setImgState(newObj);
                    // 插入图片
                    props.onToggle(e, newObj.images[0]);
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
        props.onClose();
        props.requestFocus && props.requestFocus();
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
        setDescription("");
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
        if(name=="description") {
            setDescription(e.target.value);
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
                                    <i className='iconfont icon-close cursor-pointer fs-2 text-danger position-absolute translate-middle-y top-0 end-0' onClick={() => removeImage(image.fileName)}></i>
                                </strong>
                                <Image src={image.url} width={image.width} height={image.height} alt="" />
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
                <label className="col-sm-3 col-form-label text-end">{t('imageDesc')}</label>
                <div className="col-sm-8">
                <input type='text' name="description" placeholder={t('optional')} value={description} className="form-control" onChange={handleChange}/>
                </div>
            </div>
            <div className='form-row text-center mt-4 mb-3'>
                <button disabled={imgState.loading} type="button" className="btn btn-outline-primary" onClick={onFileSubmit}>
                    {t('upload')}
                </button>
            </div>
        </div>
    );
});
ImageUploader.displayName = "ImageUploader";

// 删除图片block
export const deleteImage = (editorState:EditorState, onChange: OnChangeType, block: ContentBlock) => {
    const contentState = editorState.getCurrentContent();
    const key = block.getKey();
    const selection = editorState.getSelection();
    const selectionOfAtomicBlock = selection.merge({
        anchorKey: key,
        anchorOffset: 0,
        focusKey: key,
        focusOffset: block.getLength(),
    });
    const contentStateWithoutEntity = Modifier.applyEntity(contentState, selectionOfAtomicBlock, null);
    const editorStateWithoutEntity = EditorState.push(editorState, contentStateWithoutEntity, 'apply-entity');
    // 移除 block
    const contentStateWithoutBlock = Modifier.removeRange(contentStateWithoutEntity, selectionOfAtomicBlock, 'backward');
    const newEditorState =  EditorState.push(editorStateWithoutEntity, contentStateWithoutBlock, 'remove-range',);
    onChange(newEditorState, undefined);
};

export const UploadImage = async (files: File[]) => {
    return await Promise.all(files.map(async (file) => {
        // 判断上传文件大小
        if ( convertBytesToKB(file.size) > MAX_FILE_SIZE_IN_KB ) {
            return;
        }
        const url = window.URL.createObjectURL(file);
        let [img, dataURL] = await loadImage(url, true);
        let radio = img.height / IMAGE_HEIGHT;
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
            dataURL: dataURL,
            url: '',
            fileName: file.name,
            height: newHeight,
            width: newWidth,
            description: ''
        };
    })) as Array<AddImageProps>;
};