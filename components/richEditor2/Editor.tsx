import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {CheckListPlugin} from '@lexical/react/LexicalCheckListPlugin';
import {ClearEditorPlugin} from '@lexical/react/LexicalClearEditorPlugin';
import {CollaborationPlugin} from '@lexical/react/LexicalCollaborationPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {createDOMRange} from '@lexical/selection';
import {$getSelection} from 'lexical';
import useLexicalEditable from '@lexical/react/useLexicalEditable';
import * as React from 'react';
import {useEffect, useState, forwardRef} from 'react';

import {CAN_USE_DOM} from './shared/canUseDOM';

import {useSettings} from './context/SettingsContext';
import {useSharedHistoryContext} from './context/SharedHistoryContext';
import {createWebsocketProvider} from './collaboration';

// plugins
import ToolbarPlugin from './plugins/ToolbarPlugin';
import {MaxLengthPlugin} from './plugins/MaxLengthPlugin';
import {HorizontalRulePlugin} from '@lexical/react/LexicalHorizontalRulePlugin';
import {TabIndentationPlugin} from '@lexical/react/LexicalTabIndentationPlugin';
import TabFocusPlugin from './plugins/TabFocusPlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import DragDropPaste from './plugins/DragDropPastePlugin';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin';
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
import ImagesPlugin from './plugins/ImagesPlugin';
import InlineImagePlugin from './plugins/InlineImagePlugin';
import LinkPlugin from './plugins/LinkPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin';
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin';
import {TablePlugin} from '@lexical/react/LexicalTablePlugin';
import TableCellResizer from './plugins/TableCellResizer';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import {LayoutPlugin} from './plugins/LayoutPlugin/LayoutPlugin';
import VideoIframePlugin from './plugins/VideoIframePlugin';
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin';
import ActionTool from './actionTool';
import MentionsPlugin from './plugins/MentionsPlugin';

// ui
import Placeholder from './ui/Placeholder';
import ContentEditable from './ui/ContentEditable';

const Editor = forwardRef((prop, ref): JSX.Element => {
  const {historyState} = useSharedHistoryContext();
  const {
    settings: {
      isCollab,
      isRichText,
      isAutocomplete,
      isMaxLength,
      isCharLimit,
      isCharLimitUtf8,
      showTableOfContents,
      shouldUseLexicalContextMenu,
      tableCellMerge,
      tableCellBackgroundColor,
    },
  } = useSettings();
  const isEditable = useLexicalEditable();
  
  const text = "输入文本内容或键入'/'命令操作";
  const placeholder = <Placeholder>{text}</Placeholder>;
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches;
      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener('resize', updateViewPortWidth);
    return () => {
      window.removeEventListener('resize', updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  const contentRef = React.useRef(null);
  const [editor] = useLexicalComposerContext();
  // 光标到达底部的时候滚动条自动下移
  useEffect(() => {
    let contentObj = contentRef.current;
    return editor.registerUpdateListener(
      () => {
        editor.getEditorState().read(() => {
          if ( contentObj ) {
            const selection = $getSelection();
            // @ts-ignore
            const anchor = selection.anchor;
            // @ts-ignore
            const focus = selection.focus;
            const range = createDOMRange(
              editor,
              anchor.getNode(),
              anchor.offset,
              focus.getNode(),
              focus.offset,
            );
            // @ts-ignore
            const { bottom } = range.getBoundingClientRect();
            let diff = Math.round(bottom - window.innerHeight + 80);
            if ( diff>0 ) {
              diff = diff > 28 ? diff : 28;
              document.documentElement.scrollTop += diff;
            }
          }
        });
      },
    );
  }, [editor, isEditable]);
  

  return (
    <>
      <ToolbarPlugin  setIsLinkEditMode={setIsLinkEditMode} />
      <div
        className='editor-container'>
          <>
            {isCollab ? (
              <CollaborationPlugin
                id="main"
                providerFactory={createWebsocketProvider}
                shouldBootstrap={true}
              />
            ) : (
              <HistoryPlugin externalHistoryState={historyState} />
            )}
            <RichTextPlugin
              contentEditable={
                <div className="editor-scroller" ref={contentRef} id="richEditor">
                  <div className="editor" ref={onRef}>
                    <ContentEditable />
                  </div>
                </div>
              }
              placeholder={placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            {/* <OnChangePlugin onChange={onChange} /> */}
            {isMaxLength && <MaxLengthPlugin maxLength={10240} />}
            <DragDropPaste />
            <AutoFocusPlugin />
            <TabIndentationPlugin />
            <TabFocusPlugin />
            <HorizontalRulePlugin />
            <ListPlugin />
            <CheckListPlugin />
            {/* 限制列表indent */}
            <ListMaxIndentLevelPlugin maxDepth={7} />
            
            <CodeHighlightPlugin />
            <ImagesPlugin />
            <InlineImagePlugin />
            {/* 命令弹窗 */}
            <ComponentPickerPlugin />
            {/* 注解 */}
            {/* <CommentPlugin providerFactory={isCollab ? createWebsocketProvider : undefined} /> */}
            {/* block拖拉 */}
            {floatingAnchorElem && !isSmallWidthViewport && (
              <>
                <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                {/* 链接浮层 */}
                <FloatingLinkEditorPlugin
                  anchorElem={floatingAnchorElem}
                  isLinkEditMode={isLinkEditMode}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
                <TableCellActionMenuPlugin
                  anchorElem={floatingAnchorElem}
                  cellMerge={true}
                />
                <FloatingTextFormatToolbarPlugin
                  anchorElem={floatingAnchorElem}
                />
              </>
            )}
            {/* 链接 */}
            <LinkPlugin />
            {/* 在本页面跳转到链接页 */}
            {/* {!isEditable && <LexicalClickableLinkPlugin />} */}
            {/* 自动生成链接 */}
            {/* <AutoLinkPlugin /> */}
            {/* makedown转化 */}
            {/* <MarkdownShortcutPlugin /> */}
            {/* 表格 */}
            <TablePlugin
              hasCellMerge={tableCellMerge}
              hasCellBackgroundColor={tableCellBackgroundColor}
            />
            <TableCellResizer />
            <div>{showTableOfContents && <TableOfContentsPlugin />}</div>

            <LayoutPlugin />
            {/* 视频iframe */}
            <VideoIframePlugin />
            {/* @提示 */}
            <MentionsPlugin />
            <ClearEditorPlugin />
            <MarkdownShortcutPlugin />
          </>
      </div>
      <ActionTool />
    </>
  );
});
Editor.displayName = 'Editor';
export default Editor;
