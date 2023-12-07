import React, 
{   
    useRef, 
    useState, 
    MouseEvent, 
    ChangeEvent, 
    useEffect
} from 'react';
import { 
    EditorState
} from 'draft-js';
import { 
    toggleSelectionLink, 
    insertText, 
    isSelectionCollapsed, 
    getSelectionBlockType,
    getSelectionText,
    getSelectionEntityData
} from '../../utils/content';
import classNames from 'classnames';
import useToast from '@/hooks/useToast';
import { useTranslations } from 'use-intl';
import OverlayComp from '@/components/overlay/overlay';
import OverLayTriggerComp from '@/components/overlay/overlayTrigger';

export interface linkToolBarProps {
    onChange: Function;
    editorState: EditorState;
    active?: boolean;
    classNames?: string;
    onClick?: Function;
    requestBlur: Function;
    requestFocus: Function;
}
const LinkToolBar = (props: linkToolBarProps) => {

    const t = useTranslations('RichEditor');
    const overLayRef = useRef(null);

    const [isOpen, setOpen] = useState(false);
    const [hrefVal, setHrefVal] = useState("");
    const [descVal, setDescVal] = useState("");
    const [text, setText] = useState("");
    const textSelected = !isSelectionCollapsed(props.editorState) && getSelectionBlockType(props.editorState) !== 'atomic';
    const { href } = getSelectionEntityData(
        props.editorState,
        'LINK'
    );

    const { show } = useToast();
    const [active, setActive] = useState("");

    // 关闭modal
    function onClickCloseModal() {
        setOpen(false);
        props.requestFocus && props.requestFocus();
    }

    function handeKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        if (event.keyCode === 13) {
            // @ts-ignore
            onConfirm(event);
            event.preventDefault();
            return false;
        }
        return true;
    }

    function onUnlink(e: MouseEvent<HTMLSpanElement>) {
        e.preventDefault()
        unlink();
        onClickCloseModal();
    }

    function unlink() {
        props.onChange(
          toggleSelectionLink(props.editorState, false),
        );
    }

    function onConfirm(e: MouseEvent<HTMLSpanElement>) {
        e.preventDefault();
        let newEidtorState: EditorState = props.editorState;
        if((hrefVal && descVal)==undefined || (hrefVal && descVal)=="") {
            show({
                type: 'DANGER',
                message: t('prompt'),
            });
            return;
        }
        const targetVal = '_blank';

        if (textSelected) {
            if (hrefVal) {
                newEidtorState = toggleSelectionLink(props.editorState, hrefVal, targetVal, descVal);
            }  else {
                newEidtorState = toggleSelectionLink(props.editorState, false);
            }
        } else {
            newEidtorState = insertText(props.editorState, text || hrefVal, undefined, {
                type: 'LINK',
                data: { href: hrefVal, target: targetVal, description: descVal },
                mutability: 'MUTABLE'
            });
        }
        props.onChange(newEidtorState);
        onClickCloseModal();
    }

    function showLinkModal(e: MouseEvent<HTMLSpanElement>) {
        e.preventDefault();
        if (!textSelected) {
            return;
        }
        setOpen(true);
        setHrefVal("");
        setDescVal("");
        props.requestBlur && props.requestBlur();
    }
    function handleLink(e: ChangeEvent<HTMLInputElement>) {
        e.preventDefault();
        let name = e.target.name;
        if( name=="link" ) {
            setHrefVal(e.target.value);
        } else if( name=="desc" ) {
            setDescVal(e.target.value);
        } else if( name=="linkText" ) {
            setText(e.target.value);
        }
    }
    
    useEffect(()=>{
        if(props.active) {
            setActive("text-primary");
        } else {
            setActive("");
        }
    }, [props.active]);

    function onModalOnClick(e: MouseEvent<HTMLSpanElement>) {
        showLinkModal(e);

        if (typeof href !== 'undefined') {
            setHrefVal(href);
        }

        let selectedText = '';
        if (textSelected) {
            selectedText = getSelectionText(props.editorState);
        }
        setText(selectedText);

        props.onClick && props.onClick(props.editorState);
    }

    return (
        <>
            <span onClick={onModalOnClick} className={classNames("cursor-pointer", props.classNames, {"user-select-none opacity-50": !textSelected})} onMouseDown={(e) => e.preventDefault()}>
                <OverLayTriggerComp ref={overLayRef} placement="top" overlay={<small className='p-1'>{t('link')}</small>}>
                    <i className='iconfont icon-charulianjie fs-4 text-black-50'></i>
                </OverLayTriggerComp>
            </span>
            <span className={classNames("cursor-pointer me-4", props.classNames, {"user-select-none opacity-50": !textSelected || !href})} onMouseDown={onUnlink}>
                <i className='iconfont icon-quxiaolianjie fs-4 text-black-50'></i>
            </span>

            <OverlayComp usePortal={false} onClose={()=>{setOpen(false)}} isOpen={isOpen} className='d-flex justify-content-center align-items-center'>
                <div className="bg-white mt-5 rounded-2" style={{width:"500px", top:"-200px"}}>
                    <div className="d-flex flex-row justify-content-end">
                        <a href="#" onClick={onClickCloseModal} className="close text-dark text-decoration-none px-2">
                            <i className='iconfont icon-close fs-4'></i>
                        </a>
                    </div>

                    <div className="form-group row my-3 px-3">
                        <label className="col-sm-3 col-form-label">{t('linkText')}</label>
                        <div className="col-sm-8">
                            <input className="form-control" type="text" value={text} spellCheck={false} disabled={textSelected}
                                name="linkText"
                                placeholder={t('linkText')}
                                onKeyDown={handeKeyDown}
                                onChange={handleLink}
                            />
                        </div>
                    </div>
                    <div className="form-group row px-3">
                        <label className="col-sm-3 col-form-label">{t('link')}</label>
                        <div className="col-sm-8">
                            <input spellCheck={false} name="link" value={hrefVal} onKeyDown={handeKeyDown} onChange={handleLink} className="form-control" />
                        </div>
                    </div>
                    <div className="form-group row mt-3 px-3">
                        <label className="col-sm-3 col-form-label">{t('linkDesc')}</label>
                        <div className="col-sm-8">
                            <input spellCheck={false} name="desc" value={descVal} onChange={handleLink} className="form-control" />
                        </div>
                    </div>
                    <div className='form-row text-center my-4'>
                        <button type="button" className="btn btn-outline-primary me-5" onClick={onConfirm} onMouseDown={(e) => e.preventDefault()}>
                            {t('confirm')}
                        </button>
                        <button type="button" className="btn btn-outline-primary" onClick={onUnlink}>
                            {t('linkRmove')}
                        </button>
                    </div>
                </div>
            </OverlayComp>
        </>
    );
};

export default React.memo(LinkToolBar);