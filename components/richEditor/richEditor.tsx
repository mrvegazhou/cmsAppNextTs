import { 
    forwardRef, 
    useState, 
    useEffect, 
    useRef, 
    useCallback, 
    MouseEvent, 
    ReactNode,
    useMemo
} from "react";
import classNames from 'classnames';
import { 
    Editor,
    EditorState,
    ContentState,
    convertFromHTML,
    ContentBlock,
    RichUtils,
    getDefaultKeyBinding,
    KeyBindingUtil,
    DraftHandleValue
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import { SyntheticKeyboardEvent, MyDraftEditorProps } from './interfaces';
import { flow } from 'lodash';
import LinkToolBar from "./components/link/link";
import { ImageToolBar, deleteImage } from "./components/image/image";
import { TextIndentToolBar } from "./components/textIndent/textIndent";
import { increaseSelectionIndent } from "./utils/content";
import { keyCommandHandlers, returnHandlers } from "./utils/handles";
import TextAlignToolBar from "./components/textAlign/textAlign";
import EmojiToolBar from "./components/emoji";
import { DividerToolBar } from "./components/divider/divider";
import "./richEditor.css";
import { getCustomStyleFn, getBlockStyleFn, getBlockRendererFn, getBlockRenderMap } from "./renderers";

import { removeEntities, removeBlockTypes, removeInlineStyles } from "./utils/remove";
import { getDecorators } from "./renderers";
import { handleDrop } from "@/lib/tool";
import PopoverToolBar from "../textSelectionPopover/popover";



const RichEditor = forwardRef<Editor | undefined, MyDraftEditorProps>(
    (props: MyDraftEditorProps, ref) => {
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
        console.log(readOnly)
    };

    const popoverRef = useRef(null);

    const decorator = getDecorators();

    const sampleMarkup = '<a href="http://www.facebook.com">Example link</a>';
    const blocksFromHTML = convertFromHTML(sampleMarkup);
    const state = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap,
    );
    const [editorState, setEditorState] = useState(
        // () => EditorState.createEmpty(decorator)
        () => EditorState.createWithContent(state, decorator)
    );

    const onChange = (es: EditorState, callback?: (editorState: EditorState)=>void) => {
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
    };
    
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

    const blockRenderMap = getBlockRenderMap({});

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

    const focus = () => {
        editorRef?.current?.focus();
    };

    const requestFocus = () => {
        setTimeout(() => editorRef?.current?.focus(), 0);
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

    return (
        <>
            <div className={classNames("richEditorRoot", {"richEditorReadOnly": readOnly})} ref={rootRef}>
                <div className="richEditorControl">
                    <div className="d-flex align-items-center justify-content-left">
                        <SpanDom onToggle={undo}>
                            <i className="iconfont icon-chexiao fs-5 text-black-75 opacity-75"></i>
                        </SpanDom>
                        <SpanDom onToggle={redo}>
                            <i className="iconfont icon-zhongzuo fs-5 text-black-75 opacity-75"></i>
                        </SpanDom>
                        <SpanDom onToggle={handleClearClick}>
                            <i className="iconfont icon-qingchu fs-4 text-black-75 opacity-75"></i>
                        </SpanDom>
                        <LinkToolBar onClick={cancePopover} onChange={onChange} editorState={editorState} classNames="me-4" />
                        <TextAlignToolBar requestFocus={requestFocus}  onChange={onChange} editorState={editorState} classNames="me-4" />
                        <InlineStyleDoms 
                            editorState={editorState}
                            setEditorState={setEditorState}
                            removeInlineStyles={removeInlineStyles}
                        />
                        <BlockStyleDoms
                            editorState={editorState}
                            setEditorState={setEditorState}
                            removeBlockTypes={removeBlockTypes}
                        />
                        <TextIndentToolBar onChange={onChange} editorState={editorState} />
                        <DividerToolBar setEditorState={setEditorState} editorState={editorState} />
                        <EmojiToolBar onChange={onChange} editorState={editorState} />
                        <ImageToolBar setEditorState={setEditorState} editorState={editorState} />

                    </div>
                </div>
                <div className={classNames([cls, "richEditorContent"])} onClick={focus} ref={refs}>
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
    onToggle: (style:string)=>void;
    active?: boolean;
    classNames?: string;
    children: ReactNode;
    style?: string;
    onClick?: ()=>void;
}
const SpanDom = (props: SpanDomProps) => {
    const onToggle = (e: MouseEvent<HTMLSpanElement>) => {
        e.preventDefault();
        props.onToggle(props.style??'');
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

    return (
        <span className={classNames("cursor-pointer me-4", cls, props.classNames)} onMouseDown={onToggle}>
            {props.children}
        </span>
    );
};

export interface BlockStyleDomsProps {
    editorState: EditorState;
    setEditorState: (editorState: EditorState) => void;
    onToggle?: ()=>void;
    removeBlockTypes?: (editorState: EditorState)=>EditorState;
}
const BlockStyleDoms = (props: BlockStyleDomsProps) => {
    const {editorState, setEditorState} = props;
    const BLOCK_TYPES = [
        {label: <i className="iconfont icon-h fs-4"></i>, style: 'header-four'},
        {label: <i className="iconfont icon-h12 fs-4"></i>, style: 'header-one'},
        {label: <i className="iconfont icon-h22 fs-4"></i>, style: 'header-two'},
        {label: <i className="iconfont icon-h32 fs-4"></i>, style: 'header-three'},
        
        {label: <i className="iconfont icon-zu fs-4"></i>, style: 'blockquote'},
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
        setEditorState(RichUtils.toggleBlockType(
            editorState,
            blockStyle
        ));
        props.onToggle && props.onToggle();
    };
    
    return (
        <>
            {BLOCK_TYPES.map((type) =>
                <SpanDom
                    key={type.style}
                    active={type.style === blockType}
                    onToggle={()=>toggleBlockType(type.style)}
                    style={type.style}
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
            >
                {type.label}
            </SpanDom>
        )}
        </>
    );
}