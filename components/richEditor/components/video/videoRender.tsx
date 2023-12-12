import React, { useState, useRef } from 'react';
import classNames from 'classnames';
import OverlayComp from '@/components/overlay/overlay';
import { setMediaPosition } from '../../utils/content';
import { removeBlock } from "@/components/richEditor/utils/remove";
import { ContentBlock, EditorState } from 'draft-js';
import { handleDrop } from '@/lib/tool';
import './videoRender.scss';

const IframeContent = () => 
        <iframe
            // className={classNames(props.iframeClassName)}
            src='https://v.qq.com/txp/iframe/player.html?vid=d0163kxz8di'
            // srcDoc={props.src}
            frameBorder="0"
            allowFullScreen
            height="375" width="500"
            sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts"
            scrolling="no"
        />
const Child = React.memo(() => {
    console.log("子组件 re-render，字体颜色改变");
    const r = Math.ceil(Math.random() * 255);
    const g = Math.ceil(Math.random() * 255);
    const b = Math.ceil(Math.random() * 255);
    return <p style={{ color: 'rgb('+r+','+g+','+b+')' }}>child</p>;
});
          

const BILIBILI_URL = /^(?:https?:\/\/)?(?:www\.)?bilibili\.com\/video\/(\S+)\?(spm_id_from=|vd_source=)(?:\S+)?$/;
const TENCENT_URL = /^(?:https?:\/\/)?(?:v\.)?qq\.com\/x\/page\/(\S+)\.html$/;

const isBilibili = (url: string) => {
    return BILIBILI_URL.test(url);
};

const isTencent = (url: string) => {
    return TENCENT_URL.test(url);
};

type SourceType = 'BILIBILI' | 'TENCENT';
interface SourceResult {
    srcID: string;
    srcType: SourceType;
    url: string;
}
const getVideoSrc = (url: string, reg: RegExp, type: SourceType): SourceResult => {
    const id = url && url.match(reg)![1];
    return {
      srcID: id,
      srcType: type,
      url,
    };
};

const getSrc = (src: string): string | undefined => {
    if (isBilibili(src)) {
      const { srcID } = getVideoSrc(src, BILIBILI_URL, 'BILIBILI');
      return `//player.bilibili.com/player.html?vid=${srcID}&page=1&high_quality=1&danmaku=0`;
    }
    if (isTencent(src)) {
      const { srcID } = getVideoSrc(src, TENCENT_URL, 'TENCENT');
      return `https://v.qq.com/txp/iframe/player.html?vid=${srcID}`;
    }
    return undefined;
};

interface VideoRendererProps {
    src: string;
    className?: string;
    iframeClassName?: string;
    videoClassName?: string;
    style?: React.CSSProperties;
    onChange: Function;
    handleReadOnly: Function;
    editorState: EditorState;
    block: ContentBlock;
    containerNode: Element;
}
interface Item{
    text: React.ReactElement;
    type: string;
    command: Function;
}
interface Dictionary {
    [Key: string]: Item;
}
const VideoRenderer = (props: VideoRendererProps) => {

    const [toolbarVisible, setToolbarVisible] = useState(false);
    const [toolbarOffset, setToolbarOffset] = useState(0);
    const toolbarEleRef = useRef(null);
    const videoEleRef = useRef(null);

    const blockData = props.block.getData();
    let alignment = blockData.get('alignment');
    let description = blockData.get('description');
    // 修改图片描述
    const [changeImgDesc, setChangeImgDesc] = useState<string>(description);
    
    const imageStyles: React.CSSProperties = {};
    let clearFix = false;

    const videoControls = [
        'align-left',
        'align-center',
        'align-right',
        'remove',
    ];

    if (alignment === 'left') {
        imageStyles.float = 'left';
        clearFix = true;
    } else if (alignment === 'right') {
        imageStyles.float = 'right';
        clearFix = true;
    } else if (alignment === 'center') {
        imageStyles.textAlign = 'center';
        clearFix = true;
    } else {
        imageStyles.float = 'left';
        clearFix = true;
    }

    const setVideoAlignment = (alignment: string) => {
        props.onChange(
            setMediaPosition(
                props.editorState,
                props.block,
                { alignment },
            )
        );
        return true;
    };

    const removeVideo = () => {
        props.onChange(
            removeBlock(props.editorState, props.block),
        );
    };
    
    const videoControlItems: Dictionary = {
        'align-left': {
            text: <i className="iconfont icon-zuoduiqi fs-5"></i>,
            command: setVideoAlignment,
            type: 'left'
        },
        'align-center': {
            text: <i className="iconfont icon-juzhongduiqi fs-5"></i>,
            command: setVideoAlignment,
            type: 'center'
        },
        'align-right': {
            text: <i className="iconfont icon-youduiqi fs-5"></i>,
            command: setVideoAlignment,
            type: 'right'
        },
        'remove': {
            text: <i className="iconfont icon-delete1 fs-5"></i>,
            command: removeVideo,
            type: ''
        }
    };

    const src = React.useMemo(() => {
        console.log(222)
        return getSrc(props.src);
    }, []);
console.log(src, "--src---");

    const [isOpen, setOpen] = useState(false);

    const playVideo = () => {
        setOpen(true);
    };
    
    const executeCommand = (command: Function, type: string) => {
        if (typeof command === 'function') {
            type=="" ? command() : command(type);
        }
    };
    const renderedControlItems = videoControls.map((item) => {
        if (typeof item === 'string' && videoControlItems[item]) {
            return (
                <a
                    className={classNames("cursor-pointer text-decoration-none")}
                    key={item}
                    onClick={() => executeCommand(videoControlItems[item].command, videoControlItems[item].type)}
                >
                    {videoControlItems[item].text}
                </a>
            );
        } else {
          return null;
        }
    });

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
        const videoRect = videoEleRef.current.getBoundingClientRect();

        const right = viewRect.right - (videoRect.right - videoRect.width / 2 + toolbarRect.width / 2);
        const left = videoRect.left + videoRect.width / 2 - toolbarRect.width / 2 - viewRect.left;

        if (right < 10) {
            return right - 10;
        } else if (left < 10) {
            return left * -1 + 10;
        } else {
            return 0;
        }
    };

    const showToolbar = (event: React.MouseEvent<HTMLSpanElement>) => {
        handleDrop(event);
        setToolbarVisible(true);
        if (toolbarVisible) {
            setToolbarOffset(calcToolbarOffset());
        }
    };

    const hideToolbar = (event: React.MouseEvent<HTMLSpanElement>) => {
        handleDrop(event);
        setToolbarVisible(false);
        props.handleReadOnly(false);
    };
  
    if (src) {
        return (
        <>
            <div className='d-flex align-items-center position-relative'
                style={Object.assign({justifyContent: 'center'}, props.style??{}, imageStyles)}
                onMouseEnter={showToolbar}
                onMouseMove={showToolbar}
                onMouseLeave={hideToolbar}
            >
                <div className='iframeLayer d-flex align-items-center justify-content-center' onClick={playVideo}>
                    <i className='iconfont icon-video2 text-black-50' style={{fontSize: '50px'}}/>
                </div>
                <div className={classNames(props.className)} ref={videoEleRef}>
                    <IframeContent />
                </div>
                {toolbarVisible ? (
                    <div
                        ref={toolbarEleRef}
                        style={{ marginLeft: toolbarOffset }}
                        data-align={alignment}
                        className="richEditor-video-toolbar"
                    >
                        {renderedControlItems}
                    </div>
                ): null}
            </div>
                <Child />
            {/* <OverlayComp usePortal={true} onClose={()=>{setOpen(false)}} isOpen={isOpen}>
                <IframeContent />
            </OverlayComp> */}
            {clearFix && (
                <div
                    className="clearfix"
                    style={{ clear: 'both', height: 0, lineHeight: 0, float: 'none' }}
                />
            )}
        </>
        );
    }
    return (
        <video
          src={props.src}
          className={props.videoClassName}
          style={props.style}
          controls
        />
    );
};
export default VideoRenderer;