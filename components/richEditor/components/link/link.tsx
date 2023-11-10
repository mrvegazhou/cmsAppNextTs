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
import useSyncState from '@/hooks/useState';
import useToast from '@/hooks/useToast';

export interface linkToolBarProps {
    onChange: Function;
    editorState: EditorState;
    active?: boolean;
    classNames?: string;
    onClick?: Function;
}
const LinkToolBar = (props: linkToolBarProps) => {
    const linkModalRef = useRef<HTMLDivElement>(null);

    const [hrefVal, setHrefVal] = useSyncState("");
    const [descVal, setDescVal] = useSyncState("");
    const [text, setText] = useSyncState("");
    const textSelected = !isSelectionCollapsed(props.editorState) && getSelectionBlockType(props.editorState) !== 'atomic';
    const { href } = getSelectionEntityData(
        props.editorState,
        'LINK'
    );

    const { show } = useToast();
    const [active, setActive] = useState("");

    // 关闭modal
    function onClickCloseModal() {
        const current = linkModalRef.current;
        if (current) {
            window.bootstrap.Modal.getOrCreateInstance(current).hide();
        }
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
                message: "请填写完整",
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
        const current = linkModalRef.current;
        if (current) {
            // @ts-ignore
            window.bootstrap.Modal.getOrCreateInstance(current).show();
        }
       
        setHrefVal("");
        setDescVal("");

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
                <i className='iconfont icon-charulianjie fs-4 text-black-50'></i>
            </span>
            <span className={classNames("cursor-pointer me-4", props.classNames, {"user-select-none opacity-50": !textSelected || !href})} onMouseDown={onUnlink}>
                <i className='iconfont icon-quxiaolianjie fs-4 text-black-50'></i>
            </span>
            <div ref={linkModalRef} className="modal fade" id="linkModel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered" style={{maxWidth:"590px"}}>
                    <div className="modal-content">
                        <div className="d-flex flex-row justify-content-end">
                            <a href="#" onClick={onClickCloseModal} className="close text-dark text-decoration-none px-2" data-dismiss="modal" aria-hidden="true">
                                <i className='iconfont icon-close fs-4'></i>
                            </a>
                        </div>
                        <div className="modal-body">
                            <div className="form-group row mb-4">
                                <label className="col-sm-3 col-form-label">文字</label>
                                <div className="col-sm-8">
                                    <input className="form-control" type="text" value={text} spellCheck={false} disabled={textSelected}
                                        name="linkText"
                                        placeholder='輸入鏈接文字'
                                        onKeyDown={handeKeyDown}
                                        onChange={handleLink}
                                    />
                                </div>
                            </div>
                            <div className="form-group row">
                                <label className="col-sm-3 col-form-label">链接</label>
                                <div className="col-sm-8">
                                    <input spellCheck={false} name="link" value={hrefVal} onKeyDown={handeKeyDown} onChange={handleLink} className="form-control" />
                                </div>
                            </div>
                            <div className="form-group row mt-4">
                                <label className="col-sm-3 col-form-label">描述</label>
                                <div className="col-sm-8">
                                    <input spellCheck={false} name="desc" value={descVal} onChange={handleLink} className="form-control" />
                                </div>
                            </div>
                            <div className='form-row text-center mt-4'>
                                <button type="button" className="btn btn-outline-primary me-5" onClick={onConfirm} onMouseDown={(e) => e.preventDefault()}>
                                    确认
                                </button>
                                <button type="button" className="btn btn-outline-primary" onClick={onUnlink}>
                                    移除
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default React.memo(LinkToolBar);