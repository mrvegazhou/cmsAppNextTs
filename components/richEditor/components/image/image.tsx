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
import styled from 'styled-components';
import { useMutation } from '@tanstack/react-query';
import { 
    AtomicBlockUtils, 
    EditorState,
    ContentBlock,
    Modifier
} from 'draft-js'
import { OnChangeType } from '../../interfaces';
import classNames from 'classnames';
import useToast from '@/hooks/useToast';
import useSyncState from '@/hooks/useState';
import { uploadArticleImages } from '@/services/api';
import type {
    IArticleUploadImages
} from '@/interfaces';
import type { TBody } from '@/types';
import { loadImage } from '@/lib/tool';
import LoaderComp from '@/components/loader/loader';
import type { IData } from '@/interfaces';
import { BASE_URL, IMAGE_URL } from '@/lib/constant';

const css = `
input[type='text']::placeholder {
    opacity: 0.6;
    color: #6c757d !important;
}
.imagesWrapper {
    display: flex;
    max-width: 100%;
    padding: 0 15px;
    justify-content: center;
    align-items: center;
}
.imageBox {
    position: relative;
    border-radius: 4px;
    margin-bottom: 20px;
    margin-top: 20px;
}
.uploadBtn {
    display: inline-block;
    background-color: rgb(111, 178, 255);
    color: #fff;
    border-radius: 4px;
    padding: 5px 20px;
    margin-bottom: 20px;
    cursor: pointer;
    transition: all 300ms ease-in-out;
}
.uploadImage {
    box-sizing: border-box;
    min-width: 0px;
    line-height: 32px;
    font-size: 12px;
    color: rgb(132, 147, 165);
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    vertical-align: top;
    display: inline-flex;
    cursor: pointer;
    border-radius: 8px;
    width: 104px;
    height: 104px;
    border: 1px dashed rgb(211, 211, 211);
    margin: 0px;
    background: transparent;
}
`;

type ImageProps = {
    dataURL?: string;
    url: string;
    fileName: string;
    width?: number;
    description?: string;
    height?: number;
    deleteImage?: ()=>void;
};
interface AddImageProps {
    src: string;
    description: string;
    dataURL: string;
    width: number;
    height: number;
}
export interface imageToolBarProps {
    setEditorState: (editorState: EditorState) => void;
    editorState: EditorState;
    active?: boolean;
    classNames?: string;
    onClick?: () => void;
}
export const ImageToolBar = (props: imageToolBarProps) => {
    const imageModalRef = useRef<HTMLDivElement>(null);
    const [linkVal, setLinkVal] = useSyncState("");
    const [descVal, setDescVal] = useSyncState("");
    const { show } = useToast();
    const [active, setActive] = useState("");
    const imageUploaderRef = useRef(null)
    

    const showImageModal = () => {
        // @ts-ignore
        imageUploaderRef.current && imageUploaderRef.current.removeImages();
    };

    const onClickCloseModal = () => {
        const current = imageModalRef.current;
        if (current) {
            window.bootstrap.Modal.getOrCreateInstance(current).hide();
        }
    };

    const addImage = (editorState: EditorState, data: AddImageProps) => {
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity('IMAGE', 'IMMUTABLE', data);
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(editorState, { currentContent: contentStateWithEntity });
        return AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' ');
    };

    const onToggle = (e: MouseEvent<HTMLSpanElement>, img: ImageProps) => {
        e.preventDefault();
        if(img!=undefined && img!=null) {
            const data = {
                dataURL: img.dataURL,
                src: img.url,
                description: img.description,
                fileName: img.fileName,
                width: img.width,
                height: img.height
            }
            // @ts-ignore
            props.setEditorState(addImage(props.editorState, data));
        }
    };

    return (
        <>
            <span onClick={props.onClick} className={classNames("cursor-pointer", props.classNames, active)} onMouseDown={(e) => e.preventDefault()}>
                <a
                    data-bs-toggle="modal"
                    data-bs-target="#imageModel"
                    onClick={showImageModal}
                >
                    <i className='iconfont icon-ic_image_upload fs-4 text-black-50'></i>
                </a>
            </span>
            <div ref={imageModalRef} className="modal fade" id="imageModel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth:"590px"}}>
                    <div className="modal-content">
                        <div className="d-flex flex-row justify-content-end">
                            <a href="#" onClick={onClickCloseModal} className="close text-dark text-decoration-none px-2" data-dismiss="modal" aria-hidden="true">
                                <i className='iconfont icon-close fs-4'></i>
                            </a>
                        </div>
                        <div className="modal-body">
                            <ImageUploader multi={false} ref={imageUploaderRef} onClose={onClickCloseModal} onToggle={onToggle}/>
                        </div>
                    </div>
                </div>
            </div>
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
// 弹出框里添加图片信息
export const ImageUploader = forwardRef((props: Props, ref) => {
    let initState = {
        loading: false,
        images: [],
        formData: new FormData(),
        err: null,
        uploaded: false,
    } as State;
    const fileUploadRef = useRef<HTMLInputElement | null>(null);
    const pHeight = props.height ?? 300;
    const { show } = useToast();

    const [imgState, setImgState] = useState<State>(initState);
    const [description, setDescription] = useState<string>("");

    useEffect(() => {
        setDescription("");
    }, []);

    const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setImgState((prev) => ({
            ...prev,
            loading: true
        }));
        const files = Array.from(e.target.files || []);
        const fd = new FormData();
        files.forEach((file: File, i: number) => {
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
        e.target.value = "";
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
                        message: "上传失败",
                    });
                }
            }).catch(err => {
                show({
                    type: 'DANGER',
                    message: '上传失败',
                });
            });
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
        setDescription("");
    };

    useImperativeHandle(ref, () => ({
        removeImages() {
            setImgState(initState);
        }
    }))

    const uploadFileOnchange = () => {
        console.log(fileUploadRef.current)
        fileUploadRef.current?.click();
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        let name = e.target.name;
        if(name=="description") {
            setDescription(e.target.value);
        }
    };

    return (
        <>
            <style jsx>{css}</style>
            <div className="form-group row">
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
                <label className="col-sm-3 col-form-label text-end">图片描述</label>
                <div className="col-sm-8">
                <input type='text' name="description" placeholder='可选填' value={description} className="form-control" onChange={handleChange}/>
                </div>
            </div>
            <div className='form-row text-center mt-4'>
                <button disabled={imgState.loading} type="button" className="btn btn-outline-primary" onClick={onFileSubmit}>
                    上传
                </button>
            </div>
        </>
    );
});
ImageUploader.displayName = "ImageUploader";

// 图片在编辑框里的样式
const ImageBox = styled.div`
  position: relative;
  img.imgMedia {
    max-width: 100%;
  }
  .closeIcon {
    width: 50px;
    height: 50px;
    position: absolute;
    top: 0;
    right: 0;
  }
  .blockData {
    padding: 16px;
    padding-top: 8px;
    background-color: $white;
  }
`;
export const ImageBlock = (props: ImageProps) => {
    if(!!props.url && !!props.width) {
        return (
            <ImageBox style={{width:props.width}}>
                <Image src={props.url} alt={props.fileName} className="imgMedia" width={props.width} height={props.height}/>
                <div className="closeIcon" onClick={props.deleteImage}>
                    <i className='iconfont icon-close cursor-pointer fs-2 text-danger position-absolute translate-middle-y top-0 end-0'></i>
                </div>
                <figcaption>{props.description}</figcaption>
                <div className="blockData">
                </div>
            </ImageBox>
        );
    }
    return null;
};

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

