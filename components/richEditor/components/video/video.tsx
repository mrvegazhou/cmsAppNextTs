import React, { useState, useRef } from 'react';
import { AtomicBlockUtils, EditorState, RichUtils, ContentBlock, genKey, Modifier } from 'draft-js';
import classNames from 'classnames';
import { useTranslations } from 'use-intl';
import useToast from '@/hooks/useToast';
import OverlayComp from '@/components/overlay/overlay';
import OverLayTriggerComp from '@/components/overlay/overlayTrigger';


export interface VideoToolBarProps {
    onChange: Function;
    editorState: EditorState;
    classNames?: string;
    requestFocus: Function;
    requestBlur: Function;
    onClick?: Function;
}
const VideoToolBar = (props: VideoToolBarProps) => {
    const { show } = useToast();
    const t = useTranslations('RichEditor');
    const [videoUrl, setVideoUrl] = useState<string>("");
    const overLayRef = useRef(null);
    const [isOpen, setOpen] = useState(false);

    const hidePop = ()=>{
        // @ts-ignore
        overLayRef.current && overLayRef.current.hide();
    }
    const showVideoModal = () => {
        hidePop();
        setOpen(true);
        props.onClick && props.onClick();
        props.requestBlur && props.requestBlur();
    };
    const onClickCloseModal = () => {
        setOpen(false);
        props.requestFocus && props.requestFocus();
    };
    
    const addVideo = (editorState: EditorState, src: string): EditorState => {
        if (RichUtils.getCurrentBlockType(editorState) === 'atomic') {
            return editorState;
        }
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            'VIDEO',
            'IMMUTABLE',
            { src }
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        return AtomicBlockUtils.insertAtomicBlock(editorState, entityKey, ' ');
    };
    const onConfirm = (e: React.MouseEvent<HTMLSpanElement>) => {
        e.preventDefault();
        if(videoUrl==undefined || videoUrl=="") {
            show({
                type: 'DANGER',
                message: t('prompt'),
            });
            return;
        }
        props.onChange(addVideo(props.editorState, videoUrl));
        onClickCloseModal();
    };
    const handleVideoUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        let name = e.target.name;
        if( name=="videoUrl" ) {
            setVideoUrl(e.target.value);
        } 
    };
    const handeKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.keyCode === 13) {
            // @ts-ignore
            onConfirm(event);
            event.preventDefault();
            return false;
        }
        return true;
    };

    return (
        <>
            <span onClick={showVideoModal} className={classNames("cursor-pointer me-4", props.classNames)} onMouseDown={(e) => e.preventDefault()}>
                <OverLayTriggerComp ref={overLayRef} placement="top" overlay={<small className='p-1'>{t('videoUpload')}</small>}>
                    <i className='iconfont icon-video2 fs-3 text-black-50'></i>
                </OverLayTriggerComp>
            </span>

            <OverlayComp usePortal={false} onClose={()=>{setOpen(false)}} isOpen={isOpen} className='d-flex justify-content-center align-items-center'>
                <div className="bg-white mt-5 rounded-2" style={{width:"590px", top: "-200px"}}>
                    <div className="d-flex flex-row justify-content-end">
                        <a href="#" onClick={onClickCloseModal} className="close text-dark text-decoration-none px-2">
                            <i className='iconfont icon-close fs-4'></i>
                        </a>
                    </div>
                    <div className="form-group row my-3 px-3">
                        <label className="col-sm-3 col-form-label">{t('linkText')}</label>
                        <div className="col-sm-8">
                            <input className="form-control" type="text" value={videoUrl} spellCheck={false}
                                name="videoUrl"
                                placeholder={t('videoUrl')}
                                onKeyDown={handeKeyDown}
                                onChange={handleVideoUrl}
                            />
                        </div>
                    </div>
                    <div className='form-row text-center my-4'>
                        <button type="button" className="btn btn-outline-primary me-5" onClick={onConfirm} onMouseDown={(e) => e.preventDefault()}>
                            {t('confirm')}
                        </button>
                    </div>
                </div>
            </OverlayComp>
        </>
    );
};

export default VideoToolBar;