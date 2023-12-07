import { 
    forwardRef, 
    useState, 
    useEffect, 
    useRef,
    MouseEvent, 
    ReactNode,
    useMemo,
    useCallback
} from "react";
import classNames from 'classnames';
import { 
    Editor,
    EditorState,
    ContentBlock,
    RichUtils,
    getDefaultKeyBinding,
    KeyBindingUtil,
    DraftHandleValue,
    SelectionState
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import { SyntheticKeyboardEvent, MyDraftEditorProps } from './interfaces';
import { flow } from 'lodash';
import { useTranslations } from 'use-intl';
import LinkToolBar from "./components/link/link";
import { ImageToolBar } from "./components/image/image";
import { TextIndentToolBar } from "./components/textIndent/textIndent";
import TextColortToolbar from "./components/textColor/textColor";
import TextBgColortToolbar from "./components/textBgColor/textBgColor";
import FontFamilyToolBar from "./components/fontFamily/fontFamily";
import FontSizeToolBar from "./components/fontSize/fontSize";
import WordSpaceToolBar from "./components/wordSpace/wordSpace";
import LineHeightToolBar from "./components/lineHeight/lineHeight";
import TableToolBar from "./components/table/table";
import PreViewToolBar from "./components/preView/preView";
import { increaseSelectionIndent } from "./utils/content";
import { 
    keyCommandHandlers, 
    returnHandlers, 
    handleFiles, 
    copyHandlers, 
    cutHandlers,
    handlePastedText
} from "./utils/handles";
import TextAlignToolBar from "./components/textAlign/textAlign";
import EmojiToolBar from "./components/emoji";
import { DividerToolBar } from "./components/divider/divider";
import "./richEditor.css";
import { getCustomStyleFn, getBlockStyleFn, getBlockRendererFn, getBlockRenderMap } from "./renderers";
import { createEditorState } from "./utils/convert";
import { removeEntities, removeBlockTypes, removeInlineStyles } from "./utils/remove";
import { getDecorators } from "./renderers";
import PopoverComp from '@/components/popover/popover';
import OverLayTriggerComp from '@/components/overlay/overlayTrigger';
import PopoverToolBar from "../textSelectionPopover/popover";
import { convertFromHTML as convertFromHTML2 } from "draft-convert";

const RichEditor = forwardRef<Editor | undefined, MyDraftEditorProps>(
    (props: MyDraftEditorProps, ref) => {
    
    const t = useTranslations('RichEditor');
    let { id = 'draft-editor', style, ...rest } = props;
    const editorRef = useRef<Editor | null>(null);
    const rootRef = useRef(null);
    const [target, setTarget] = useState<Element>()
    const refs = useCallback((el: any) => {
      if (el != null) {
        setTarget(el)
      } else {
        setTarget(undefined)
      }
    }, [])

    const [readOnly, setReadOnly] = useState(false);
    const handleReadOnly = (flag: boolean) => {
        setReadOnly(flag);
    };

    const popoverRef = useRef(null);

    const decorator = getDecorators();

    let isLiving: boolean = true;
    useEffect(()=>{
        isLiving = true;
        return ()=>{
            isLiving = false;
        }
    },[]);

    const sampleMarkup = `<p>sss</p><hr class="hr richEditorHr" style="width: 70%; margin-left: auto; margin-right: auto;"><a href="http://www.facebook.com">Example link</a><p></p><p></p><table class="re-table"><tbody><tr><td colspan="1" rowspan="1">sss</td><td colspan="1" rowspan="1"></td><td colspan="1" rowspan="1"></td></tr><tr><td colspan="1" rowspan="1"></td><td colspan="1" rowspan="1"></td><td colspan="1" rowspan="1"></td></tr><tr><td colspan="1" rowspan="1"></td><td colspan="1" rowspan="1"></td><td colspan="1" rowspan="1"></td></tr></tbody></table>`;

    const [editorState, setEditorState] = useState(
        // () => EditorState.createWithContent(state, decorator)
        () => createEditorState(sampleMarkup, decorator)
    );

    const onChange = useCallback((es: EditorState, callback?: (editorState: EditorState)=>void) => {
        let newEditorState = es;

        if (!(editorState instanceof EditorState)) {
            newEditorState = EditorState.set(es, {
                decorator: decorator,
            });
        }
        setEditorState(newEditorState);

        if (callback) {
            callback(es);
        }
    }, [EditorState]);
    
    const [cls, setCls] = useState("richEditorEditor");
    useEffect(() => {
        editorRef?.current?.focus();
        const contentState = editorState.getCurrentContent();
        let className = cls;
        if (!contentState.hasText()) {
            if (contentState.getBlockMap().first().getType() !== 'unstyled') {
                className += ' richEditorHidePlaceholder';
                setCls(className);
            }
        }
    }, []);

    const [mustBlur, setMustBlur] = useState<boolean>(false);
    const requestFocus = () => {
        if (mustBlur) {
            return;
        }
        setTimeout(() => editorRef?.current?.focus(), 0);
    };

    const requestBlur = () => {
        setTimeout(() => editorRef?.current?.blur(), 0);
    };

    const styleMap = {
        CODE: {
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
          fontSize: 16,
          padding: 2,
        },
        UNDERLINE: {
          textDecoration: 'none',
          borderBottom: '1px solid',
        },
        SUBSCRIPT: { fontSize: '0.6em', verticalAlign: 'sub' },
        SUPERSCRIPT: { fontSize: '0.6em', verticalAlign: 'super' }
    };

    const blockRenderMap = getBlockRenderMap({
        editorState: editorState,
        readOnly: readOnly,
        onChange: onChange,
        requestBlur: requestBlur,
    });

    // 媒体
    const blockRendererFn = (contentBlock: ContentBlock) => {
        // @ts-ignore
        let containerNode = rootRef.current;
        // @ts-ignore
        return getBlockRendererFn({contentBlock, containerNode, 
            blockProps: {
                handleReadOnly: handleReadOnly, 
                onChange: onChange,
                forceRender: forceRender,
                editorState: editorState
            }});
    };
    
    const customStyleFn = getCustomStyleFn({}, {
        customStyleFn: props.customStyleFn,
    });

    const blockStyleFn = (contentBlock: ContentBlock) => {
        return getBlockStyleFn(contentBlock);
    };

    const cancePopover = useMemo(()=>
    () => {
        if(popoverRef.current) {
            // @ts-ignore
            popoverRef.current.reset();
        }
    }, []);
    
    const handleClearClick = () => {
        const stateWithoutEditing = flow([
          removeInlineStyles,
          removeEntities,
          removeBlockTypes,
        ])(editorState);
        setEditorState(stateWithoutEditing);
    };

    const onTab = (event: SyntheticKeyboardEvent) => {
        keyCommandHandlers('tab', editorState, props, onChange, event)
        let [newEditorState, _] = increaseSelectionIndent(editorState, 6);
        onChange(newEditorState);
    };

    const handleKeyCommand = (command: string, editorState: EditorState) => {
        // @ts-ignore
        return keyCommandHandlers(command, editorState, props, onChange, event) as DraftHandleValue;
    };

    const handleReturn = (event: SyntheticKeyboardEvent, editorState: EditorState) => returnHandlers(event, editorState, props, onChange);
    
    // 复制上传图片
    const handleDroppedFiles = (selectionState: SelectionState, files: File[]) => {
        return handleFiles(files, {
            editorState: editorState,
            onChange: onChange,
            isLiving: isLiving
        });
    };

    const handlePastedFiles = (files: File[]) => {
        return handleFiles(files, {
            editorState: editorState,
            onChange: onChange,
            isLiving: isLiving
        });
    };

    const handleCopyContent = (editor: Editor, event: React.ClipboardEvent<HTMLElement>) => {
        copyHandlers(editor, event);
    };

    const handleCutContent = (editor: Editor, event: React.ClipboardEvent<HTMLElement>) => {
        cutHandlers(editor, event);
    };

    const handlePastedContent = ( _: string, html: string | undefined, editorState: EditorState) => {
        return handlePastedText(html, editorState, onChange);
    };

    // 映射自定义的键盘快捷键
    const myKeyBindingFn = (event: SyntheticKeyboardEvent) => {
        if (event.key === 'S' /* `S` key */ && KeyBindingUtil.hasCommandModifier(event)) {
            return 'richEditor-save';
        } else if (event.key === 'K' /* `K` key */ && KeyBindingUtil.hasCommandModifier(event)) {
            return 'insert-link';
        } else if (event.key === 'Tab') {
            event.preventDefault();
            onTab(event);
        }
        return getDefaultKeyBinding(event);
    };

    const forceRender = () => {
        const selectionState = editorState.getSelection();
        let newEditorState = EditorState.set(editorState, { decorator: decorator });
        setEditorState(EditorState.forceSelection(newEditorState, selectionState));
    };

    const undo = () => {
        setEditorState(EditorState.undo(editorState));
    };
    const redo = () => {
        setEditorState(EditorState.redo(editorState));
    };

    // 是否全屏
    const [fullScreen, setFullScreen] = useState(false);

    return (
        <>
            <div className={classNames("richEditorRoot", {"richEditorReadOnly": readOnly}, {"richEditorFullScreen": fullScreen})} ref={rootRef}>
                <div className="richEditorControl">
                    <div className="d-flex align-items-center justify-content-left">
                        <SpanDom onToggle={undo} title={t('undo')}>
                            <i className="iconfont icon-chexiao fs-5 text-black-75 opacity-75"></i>
                        </SpanDom>
                        <SpanDom onToggle={redo} title={t('redo')}>
                            <i className="iconfont icon-zhongzuo fs-5 text-black-75 opacity-75"></i>
                        </SpanDom>
                        <SpanDom onToggle={handleClearClick} title={t('clear')}>
                            <i className="iconfont icon-qingchu fs-4 text-black-75 opacity-75"></i>
                        </SpanDom>
                        <LinkToolBar onClick={cancePopover} onChange={onChange} editorState={editorState} classNames="me-4" requestBlur={requestBlur} requestFocus={requestFocus} />
                        <TextAlignToolBar requestFocus={requestFocus} onChange={onChange} editorState={editorState} classNames="me-4" />
                        <InlineStyleDoms 
                            editorState={editorState}
                            setEditorState={setEditorState}
                            removeInlineStyles={removeInlineStyles}
                        />
                        <BlockStyleDoms
                            editorState={editorState}
                            onChange={onChange}
                            requestFocus={requestFocus}
                        />
                        <TextIndentToolBar onChange={onChange} editorState={editorState} />
                        <DividerToolBar setEditorState={setEditorState} editorState={editorState} />
                        <EmojiToolBar onChange={onChange} editorState={editorState} />
                        <ImageToolBar setEditorState={setEditorState} editorState={editorState} requestBlur={requestBlur} requestFocus={requestFocus} />
                        <TextColortToolbar onChange={onChange} editorState={editorState}/>
                        <TextBgColortToolbar onChange={onChange} editorState={editorState}/>
                        <FontFamilyToolBar requestFocus={requestFocus} onChange={onChange} editorState={editorState}/>
                        <FontSizeToolBar requestFocus={requestFocus} onChange={onChange} editorState={editorState}/>
                        <WordSpaceToolBar requestFocus={requestFocus} onChange={onChange} editorState={editorState}/>
                        <LineHeightToolBar requestFocus={requestFocus} onChange={onChange} editorState={editorState}/>
                        <TableToolBar onChange={onChange} editorState={editorState} requestBlur={requestBlur} requestFocus={requestFocus} />
                        <PreViewToolBar editorState={editorState} />

                        {fullScreen==false ? (
                            <SpanDom onToggle={()=>setFullScreen(true)} title={t('fullScreen')}>
                                <i className="iconfont icon-quanping fs-3 text-black-75"></i>
                            </SpanDom>
                        ) : (
                            <SpanDom onToggle={()=>setFullScreen(false)} title={t('exitFullScreen')}>
                                <i className="iconfont icon-tuichuquanping fs-3 text-black-75"></i>
                            </SpanDom>
                        )}
                        
                    </div>
                </div>
                <div className={classNames([cls, "richEditorContent"])} onClick={requestFocus} ref={refs}>
                    <Editor 
                        ref={editorRef}
                        editorState={editorState} 
                        onChange={setEditorState} 
                        blockStyleFn={blockStyleFn}
                        blockRenderMap={blockRenderMap}
                        blockRendererFn={blockRendererFn}
                        customStyleMap={styleMap}
                        customStyleFn={customStyleFn}
                        keyBindingFn={myKeyBindingFn}
                        stripPastedStyles={true}
                        handleKeyCommand={handleKeyCommand}
                        handleReturn={handleReturn}
                        handleDroppedFiles={handleDroppedFiles}
                        handlePastedFiles={handlePastedFiles}
                        onCopy={handleCopyContent}
                        onCut={handleCutContent}
                        handlePastedText={handlePastedContent}
                        readOnly={readOnly}
                    />
                    {/* <PopoverToolBar target={target} ref={popoverRef} /> */}
                </div>
            </div>
        </>
    );
});
RichEditor.displayName = 'RichEditor';
export default RichEditor;

export interface SpanDomProps {
    onToggle?: (style:string)=>void;
    active?: boolean;
    classNames?: string;
    children: ReactNode;
    style?: string;
    onClick?: ()=>void;
    title: string;
}
const SpanDom = (props: SpanDomProps) => {
    const overLayRef = useRef(null);
    const onToggle = (e: MouseEvent<HTMLSpanElement>) => {
        e.preventDefault();
        props.onToggle && props.onToggle(props.style??'');
        if(props.onClick) {
            props.onClick();
        }
        
    };
    const [cls, setCls] = useState("text-black-50");
    useEffect(()=>{
        setCls("text-black-50");
        if(props.active) {
            setCls("text-primary");
        }
    }, [props.active]);

    const hidePop = ()=>{
        // @ts-ignore
        overLayRef.current && overLayRef.current.hide();
    }

    return (
        <span className={classNames("cursor-pointer me-4", cls, props.classNames)} onMouseDown={(e)=>{onToggle(e); hidePop();}}>
            <OverLayTriggerComp ref={overLayRef} placement="top" overlay={<small className='p-1'>{props.title}</small>}>
                {props.children}
            </OverLayTriggerComp>
        </span>
    );
};

export interface BlockStyleDomsProps {
    editorState: EditorState;
    onChange: Function;
    onToggle?: Function;
    requestFocus?: Function;
}
const BlockStyleDoms = (props: BlockStyleDomsProps) => {
    const t = useTranslations('RichEditor');
    const {editorState, onChange} = props;
    const BLOCK_TYPES = [
        {label: <i className="iconfont icon-quote fs-4"></i>, style: 'blockquote'},
        {label: <i className="iconfont icon-unorderedList fs-4"></i>, style: 'unordered-list-item'},
        {label: <i className="iconfont icon-youxuliebiao fs-4"></i>, style: 'ordered-list-item'},
        {label: <i className="iconfont icon-daima fs-4"></i>, style: 'code-block'},
    ];
    const selection = editorState.getSelection();
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    const toggleBlockType = (blockStyle: string) => {
        onChange(RichUtils.toggleBlockType(
            editorState,
            blockStyle
        ));
        props.onToggle && props.onToggle();
    };

    const popoverCompRef = useRef(null);
    const BLOCK_H_TITLES = [
        {label: <i className="iconfont icon-h12 fs-4 opacity-75"></i>, style: 'header-one'},
        {label: <i className="iconfont icon-h fs-4 opacity-75"></i>, style: 'header-two'},
        {label: <i className="iconfont icon-h22 fs-4 opacity-75"></i>, style: 'header-three'},
        {label: <i className="iconfont icon-h32 fs-4 opacity-75"></i>, style: 'header-four'},
    ];
    const toggleHTitle = (blockStyle: string) => {
        onChange(RichUtils.toggleBlockType(editorState, blockStyle));
        // @ts-ignore
        popoverCompRef.current && popoverCompRef.current.hide();
        props.requestFocus && props.requestFocus();
    };
    const content = (
        <div className='richEditorHTitle'>
           {BLOCK_H_TITLES.map((item) => {
                return (
                    <div
                        key={item.style}
                        className={classNames('richEditorHTitleItem opacity-75', {'richEditorHTitleItemActive': blockType==item.style})}
                        onClick={()=>toggleHTitle(item.style)}
                    >
                        {item.label}
                    </div>
                );
            })}
        </div>
    );
    
    return (
        <>
            <PopoverComp ref={popoverCompRef} trigger="click" placement="bottom" content={content}>
                <span className={classNames("cursor-pointer opacity-75 me-4",)} onMouseDown={(e) => e.preventDefault()}>
                    <OverLayTriggerComp placement="top" overlay={<small className='p-1'>{t('Htitle')}</small>}>
                        <i className='iconfont icon-zitibiaoti fs-4 opacity-75'></i>
                    </OverLayTriggerComp>
                </span>
            </PopoverComp>
            {BLOCK_TYPES.map((type) =>
                <SpanDom
                    key={type.style}
                    active={type.style === blockType}
                    onToggle={()=>toggleBlockType(type.style)}
                    style={type.style}
                    // @ts-ignore
                    title={t(type.style)}
                >
                    {type.label}
                </SpanDom>
            )}
        </>
    );     
}

export interface InlineStyleDomsProps {
    editorState: EditorState;
    setEditorState: (editorState: EditorState) => void;
    onToggle?: ()=>void;
    removeInlineStyles: (editorState: EditorState, styleName: string)=>EditorState;
}
const InlineStyleDoms = (props: InlineStyleDomsProps) => {
    const t = useTranslations('RichEditor');
    const INLINE_STYLES = [
        {label: <i className="iconfont icon-cuti fs-4"></i>, style: 'BOLD'},
        {label: <i className="iconfont icon-zitixieti fs-4"></i>, style: 'ITALIC'},
        {label: <i className="iconfont icon-zitixiahuaxian fs-4"></i>, style: 'UNDERLINE'},
        {label: <i className="iconfont icon-subscript2 fs-4"></i>, style: 'SUBSCRIPT'},
        {label: <i className="iconfont icon-superscript2 fs-4"></i>, style: 'SUPERSCRIPT'}
    ];
    var currentStyle = props.editorState.getCurrentInlineStyle();
    
    const exclusiveInlineStyles = {
        SUPERSCRIPT: 'SUBSCRIPT',
        SUBSCRIPT: 'SUPERSCRIPT',
    };
    const onToggleInlineStyle = (inlineStyle: string) => {
        // @ts-ignore
        const exclusiveInlineStyle = exclusiveInlineStyles[inlineStyle];
        let editorState = props.editorState;
        if (
            exclusiveInlineStyle &&
            currentStyle.has(exclusiveInlineStyle)
        ) {
            editorState = RichUtils.toggleInlineStyle(
                editorState,
                exclusiveInlineStyle
            );
        }
        props.setEditorState(RichUtils.toggleInlineStyle(
            props.editorState,
            inlineStyle
        ));
        props.onToggle && props.onToggle();
        if(currentStyle.has(inlineStyle)) {
            props.setEditorState(props.removeInlineStyles(props.editorState, inlineStyle));
        }
    };

    return (
        <>
            {INLINE_STYLES.map(type =>
            <SpanDom
                key={type.style}
                active={currentStyle.has(type.style)}
                onToggle={()=>onToggleInlineStyle(type.style)}
                style={type.style}
                // @ts-ignore
                title={t(type.style)}
            >
                {type.label}
            </SpanDom>
        )}
        </>
    );
}