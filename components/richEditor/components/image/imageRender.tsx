import { ContentBlock, EditorState } from "draft-js";
import classNames from 'classnames';
import { CSSProperties, useState, MouseEvent, useRef } from "react";
import Image from "next/image";
import { setMediaPosition, setMediaData } from "@/components/richEditor/utils/content";
import { removeBlock } from "@/components/richEditor/utils/remove";
import { handleDrop, isHttpOrHttps } from "@/lib/tool";
import useToast from '@/hooks/useToast';
import "./imageRender.css"

interface Item{
    text: React.ReactElement;
    type: string;
    command: Function;
}
interface Dictionary {
    [Key: string]: Item;
} 

interface ImageProps {
    url: string;
    dataURL: string;
    width: number;
    height: number;
    description: string;
}
interface ImageRenderProps {
    editorState: EditorState;
    block: ContentBlock;
    mediaData: ImageProps;
    containerNode: Element;
    onChange: Function;
    handleReadOnly: Function;
    forceRender: Function;
    zoom?: number;
    imageResizable?: boolean;
    imageEqualRatio?: boolean;
}
let initialLeft: number;
let initialTop: number;
let initialWidth: number;
let initialHeight: number;
let reSizeType: string;
let zoom: number;
const ImageRenderer = (props: ImageRenderProps) => {

    const { show } = useToast();
    const imageControls = [
        'float-left',
        'float-right',
        'align-left',
        'align-center',
        'align-right',
        'size',
        'link',
        'remove',
    ];

    let imageEqualRatio =  props.imageEqualRatio ?? false;

    zoom = props.zoom ? props.zoom : 1;
    const imageResizable = props.imageResizable ?? true;

    const toolbarEleRef = useRef(null);
    const imageEleRef = useRef(null);

    const [toolbarVisible, setToolbarVisible] = useState(false);
    const [toolbarOffset, setToolbarOffset] = useState(0);
    const [linkEditorVisible, setLinkEditorVisible] = useState(false);
    const [sizeEditorVisible, setSizeEditorVisible] = useState(false);
    const [tempLink, setTempLink] = useState("");
    const [linkTarget, setLinkTarget] = useState("");
    const [inputDescVisible, setInputDescVisible] = useState(false);

    const blockData = props.block.getData();
    const float = blockData.get('float');
    let alignment = blockData.get('alignment');

    const { dataURL, url, width, height, description } = props.mediaData;
    const src = (url=='' || typeof url == 'undefined' ) ? dataURL : url;

    const [imgSize, setImgSize] = useState({width: width, height: height});
    // 修改图片长宽的
    const [changeImgSize, setChangeImgSize] = useState({width: width, height: height});
    // 修改图片描述
    const [changeImgDesc, setChangeImgDesc] = useState<string>(description);

    const imageStyles: CSSProperties = {};
    let clearFix = false;

    if (float) {
      alignment = null;
    } else if (alignment === 'left') {
      imageStyles.float = 'left';
      clearFix = true;
    } else if (alignment === 'right') {
      imageStyles.float = 'right';
      clearFix = true;
    } else if (alignment === 'center') {
      imageStyles.textAlign = 'center';
    } else {
      imageStyles.float = 'left';
      clearFix = true;
    }

    const showToolbar = (event: MouseEvent<HTMLSpanElement>) => {
        handleDrop(event);
        setToolbarVisible(true);
        if (toolbarVisible) {
            setToolbarOffset(calcToolbarOffset());
        }
    };

    const hideToolbar = (event: MouseEvent<HTMLSpanElement>) => {
        handleDrop(event);
        setToolbarVisible(false);
        setLinkEditorVisible(false);
        setSizeEditorVisible(false);
        props.handleReadOnly(false);
    };

    const setImageFloat = (float: string) => {
        props.onChange(
          setMediaPosition(
            props.editorState,
            props.block,
            { float }
          )
        );
        return true;
    };

    const setImageAlignment = (alignment: string) => {
        props.onChange(
            setMediaPosition(
                props.editorState,
                props.block,
                { alignment },
            )
        );
        return true;
    };

    const toggleLinkEditor = () => {
        props.handleReadOnly(true);
        setLinkEditorVisible(pre => {
            pre = !pre
            return pre
        });
    };

    const toggleSizeEditor = () => {
        props.handleReadOnly(true);
        setLinkEditorVisible(false);
        setSizeEditorVisible(pre => {
            pre = !pre
            return pre
        });
    };

    const removeImage = () => {
        props.onChange(
            removeBlock(props.editorState, props.block),
        );
    };

    const imageControlItems: Dictionary = {
        'float-left': {
          text: <i className="iconfont icon-format-float-left fs-5"></i>,
          command: setImageFloat,
          type: 'left'
        },
        'float-right': {
          text: <i className="iconfont icon-format-float-right fs-5"></i>,
          command: setImageFloat,
          type: 'right'
        },
        'align-left': {
          text: <i className="iconfont icon-zuoduiqi fs-5"></i>,
          command: setImageAlignment,
          type: 'left'
        },
        'align-center': {
          text: <i className="iconfont icon-juzhongduiqi fs-5"></i>,
          command: setImageAlignment,
          type: 'center'
        },
        'align-right': {
          text: <i className="iconfont icon-youduiqi fs-5"></i>,
          command: setImageAlignment,
          type: 'right'
        },
        'size': {
            text: <i className="iconfont icon-size fs-5"></i>,
            command: toggleSizeEditor,
            type: ''
        },
        'link': {
          text: <i className="iconfont icon-charulianjie fs-5"></i>,
          command: toggleLinkEditor,
          type: ''
        },
        'remove': {
          text: <i className="iconfont icon-delete1 fs-5"></i>,
          command: removeImage,
          type: ''
        },
    };

    const calcToolbarOffset = () => {
        const container = props.containerNode;
        if (!container) {
            return 0;
        }
        if (!toolbarEleRef) {
            return 0;
        }
        // @ts-ignore
        const viewRect = container.querySelector('.richEditorContent').getBoundingClientRect();
        // @ts-ignore
        const toolbarRect = toolbarEleRef.current.getBoundingClientRect();
        // @ts-ignore
        const imageRect = imageEleRef.current.getBoundingClientRect();

        const right = viewRect.right - (imageRect.right - imageRect.width / 2 + toolbarRect.width / 2);
        const left = imageRect.left + imageRect.width / 2 - toolbarRect.width / 2 - viewRect.left;

        if (right < 10) {
            return right - 10;
        } else if (left < 10) {
            return left * -1 + 10;
        } else {
            return 0;
        }
    };

    const executeCommand = (command: Function, type: string) => {
        if (typeof command === 'function') {
            type=="" ? command() : command(type);
        }
    };

    const renderedControlItems = imageControls.map((item) => {
        if (typeof item === 'string' && imageControlItems[item]) {
            return (
                <a
                    className={classNames("cursor-pointer text-decoration-none")}
                    key={item}
                    onClick={() => executeCommand(imageControlItems[item].command, imageControlItems[item].type)}
                >
                    {imageControlItems[item].text}
                </a>
            );
        } else {
          return null;
        }
    });

    const confirmImageLink = () => {
        if (tempLink !== null) {
            if (!isHttpOrHttps(tempLink)) {
                show({
                    type: 'DANGER',
                    message: "地址格式错误",
                });
                return false;
            }
            const entityKey = props.block.getEntityAt(0);
            props.onChange(
                setMediaData(
                    props.editorState,
                    entityKey,
                    { tempLink }
                ),
            );
            // @ts-ignore
            window.setImmediate(props.forceRender);
            setLinkEditorVisible(false);
            props.handleReadOnly(false);
        }
        return true;
    };

    const handleLinkInputKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.keyCode === 13) {
            confirmImageLink();
        }
    };

    const setImageLink = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleDrop(event);
        setTempLink(event.currentTarget.value);
    };

    const setImageLinkTarget = (event: React.ChangeEvent<HTMLInputElement>, linkTarget: string) => {
        handleDrop(event);
        linkTarget = linkTarget === '_blank' ? '' : '_blank';
        setLinkTarget(linkTarget);
        const entityKey = props.block.getEntityAt(0);
        props.onChange(
            setMediaData(
                props.editorState,
                entityKey,
                { linkTarget },
            )
        );
    };

    const confirmImageSize = (imgW: number, imgH: number) => {
        let newImageSize: {width: undefined | number; height: undefined | number} = {width: undefined, height: undefined};
        if (!isNaN(imgW)) {
            newImageSize.width = Math.abs(imgW);
        }
        if (!isNaN(imgH)) {
            newImageSize.height = Math.abs(imgH);
        }
        props.onChange(
            setMediaData(
                props.editorState,
                props.block.getEntityAt(0),
                newImageSize,
            )
        );
        // @ts-ignore
        window.setImmediate(props.forceRender);
        return true;
    };

    const setImageWidth = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = Number(event.currentTarget.value);
        if (value && !isNaN(value)) {
            setChangeImgSize(prev => {
                return Object.assign({}, prev, {width: value})
            });
        }
      };
    
    const setImageHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
        let value = Number(event.currentTarget.value);
        if (value && !isNaN(value)) {
            setChangeImgSize(prev => {
                return Object.assign({}, prev, {height: value})
            });
        }
    };

    const handleSizeInputKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.keyCode === 13) {
            confirmImageSize(changeImgSize.width, changeImgSize.height);
        }
    };

    const repareChangeSize = (type: string) => (event: React.MouseEvent) => {
        handleDrop(event);
        reSizeType = type;
        // @ts-ignore
        const imageRect = imageEleRef.current.getBoundingClientRect();
        initialTop = 0;
        initialLeft = 0;
        initialWidth = imageRect.width;
        initialHeight = imageRect.height;
        zoom = imageRect.width / imageRect.height;
        // @ts-ignore
        document.addEventListener('mousemove', moveImage);
        // @ts-ignore
        document.addEventListener('mouseup', upImage);
    };

    const changeSize = (event: React.MouseEvent) => {
        const type = reSizeType;
        if (!initialLeft) {
          initialLeft = event.screenX;
          initialTop = event.screenY;
        }
        if (type === 'rightbottom') {
            initialHeight += event.screenY - initialTop;
            initialWidth += event.screenX - initialLeft;
        }
        if (type === 'leftbottom') {
            initialHeight += event.screenY - initialTop;
            initialWidth += -event.screenX + initialLeft;
        }
    
        initialLeft = event.screenX;
        initialTop = event.screenY;
    };

    const moveImage = (event: React.MouseEvent) => {
        changeSize(event);
        setImgSize(prev => {
            return Object.assign({}, prev, {width: Math.abs(initialWidth), height: Math.abs(initialHeight)});
        });
    };

    const confirmImageSizeEqualRatio = () => {
        let equalWidth: number = 0;
        let equalHeight: number = 0;
        let newImageSize = {width: equalWidth, height: equalHeight};
        let imgW = initialWidth;
        let imgH = initialHeight;
        // 宽度过大 图片等比缩放
        if (imgW / imgH > zoom) {
            equalWidth = Math.floor(imgH * zoom);
            setImgSize(prev => {
                return Object.assign({}, prev, {width: equalWidth});
            });
            equalHeight = imgH;
        } else if (imgW / imgH < zoom) {
            equalHeight = Math.floor(imgW / zoom);
            setImgSize(prev => {
                return Object.assign({}, prev, {height: equalHeight});
            });
            equalWidth = imgW;
        }
        if (equalWidth !== 0) {
            newImageSize.width = equalWidth;
        }
        if (equalHeight !== 0) {
            newImageSize.height = equalHeight;
        }

        setMediaData(
            props.editorState,
            props.block.getEntityAt(0),
            newImageSize
        )
        // @ts-ignore
        window.setImmediate(props.forceRender);
        return true;
    };

    const upImage = (event: React.MouseEvent) => {
        if (imageEqualRatio) {
            confirmImageSizeEqualRatio();
        } else {
            confirmImageSize(initialWidth, initialHeight);
        }
        // @ts-ignore
        document.removeEventListener('mousemove', moveImage);
        // @ts-ignore
        document.removeEventListener('mouseup', upImage);
    };
    
    // 图片注释输入框
    const showInputDesc = (event: React.MouseEvent<HTMLSpanElement>) => {
        handleDrop(event);
        props.handleReadOnly(true);
        setInputDescVisible(true);
    };

    const setImageDescription = (event: React.ChangeEvent<HTMLInputElement>,) => {
        let value = event.currentTarget.value;
        if (value.length>100) {
            return;
        }
        setChangeImgDesc(value);
    };
    // 提交图片注释
    const handleImageDescription = (val: string) => {
        const entityKey = props.block.getEntityAt(0);
        props.onChange(
            setMediaData(
                props.editorState,
                entityKey,
                { description: val },
            )
        );
        return true;
    };

    const blurImgDesc = () => {
        handleImageDescription(changeImgDesc);
        props.handleReadOnly(false);
    };

    const handleImgDescKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.keyCode === 13) {
            blurImgDesc();
        }
    };

    return (
        <div className="richEditor-media">
            <div
                style={imageStyles}
                onMouseEnter={showToolbar}
                onMouseMove={showToolbar}
                onMouseLeave={hideToolbar}
                className="richEditor-image"
            >
                {toolbarVisible ? (
                    <div
                        style={{ marginLeft: toolbarOffset }}
                        ref={toolbarEleRef}
                        data-float={float}
                        data-align={alignment}
                        className="richEditor-media-toolbar"
                    >
                        {linkEditorVisible ? (
                            <div className="richEditor-image-link-editor">
                                <div className="editor-input-group">
                                    <label>链接</label>
                                    <input type="text" 
                                            value={tempLink}
                                            placeholder='输入链接地址并回车'
                                            onKeyDown={handleLinkInputKeyDown}
                                            onChange={setImageLink}
                                    />
                                </div>
                                <div className="switch-group">
                                    <div className="form-check form-switch">
                                        <label>在新窗口打开</label>
                                        <input className="form-check-input" type="checkbox" checked={linkTarget === '_blank'} value="" onChange={(e) => setImageLinkTarget(e, linkTarget)} />
                                    </div>
                                </div>
                                <button type="button" className="w-30 btn btn-primary" onClick={confirmImageLink}>确定</button>
                            </div>
                        ) : null}
                        {sizeEditorVisible ? (
                            <div className="richEditor-image-size-editor">
                                <div className="editor-input-group">
                                    <label>长</label>
                                    <input
                                        type="text"
                                        placeholder="输入长"
                                        onKeyDown={handleSizeInputKeyDown}
                                        onChange={setImageWidth}
                                        defaultValue={imgSize.width}
                                        />
                                    <span className="ms-2">px</span>
                                </div>
                                <div className="editor-input-group">
                                    <label>宽</label>
                                    <input
                                        type="text"
                                        placeholder="输入宽"
                                        onKeyDown={handleSizeInputKeyDown}
                                        onChange={setImageHeight}
                                        defaultValue={imgSize.height}
                                    />
                                    <span className="ms-2">px</span>
                                </div>
                                <button type="button" className="w-30 btn btn-primary" onClick={()=>{ confirmImageSize(changeImgSize.width, changeImgSize.height) }}>确定</button>
                            </div>
                        ) : null}
                        {renderedControlItems}
                    </div>
                ) : null}
                <div
                    style={{
                        position: 'relative',
                        width: `${imgSize.width}px`,
                        height: `${imgSize.height}px`,
                        display: 'inline-block',
                        marginBottom: '30px',
                    }}
                >
                    <div className="d-flex flex-column align-items-center">
                        <Image ref={imageEleRef} src={src} alt="Alt" width={imgSize.width} height={imgSize.height}/>
                        {inputDescVisible ? (
                            <input className="editor-input text-center p-1" 
                                defaultValue={changeImgDesc} 
                                onChange={setImageDescription}
                                placeholder="添加图片注释，不超过100字(可选)"
                                onBlur={blurImgDesc}
                                onKeyDown={handleImgDescKeyDown}
                            />
                        ) : (<figcaption onClick={showInputDesc} 
                                        className={classNames("text-left p-1 mt-1 text-black-50")} 
                                        style={{fontSize:"14px"}}>{changeImgDesc ? changeImgDesc : '添加图片注释，不超过100字(可选)'}
                            </figcaption>)}
                    </div>
                    
                    {toolbarVisible && imageResizable ? (
                        <>
                            <div
                                role="presentation"
                                className="richEditor-csize-icon right-bottom"
                                onMouseDown={repareChangeSize('rightbottom')}
                            />
                            <div
                                role="presentation"
                                className="richEditor-csize-icon left-bottom"
                                onMouseDown={repareChangeSize('leftbottom')}
                            />
                        </>
                    ) : null}
                </div>
            </div>
            {clearFix && (
                <div
                    className="clearfix"
                    style={{ clear: 'both', height: 0, lineHeight: 0, float: 'none' }}
                />
            )}
        </div>
    );
};

export default ImageRenderer;