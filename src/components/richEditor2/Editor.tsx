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
import type { Doc } from 'yjs';

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
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin';
import EquationsPlugin from './plugins/EquationsPlugin';
import ExcalidrawPlugin from './plugins/ExcalidrawPlugin';

// ui
import Placeholder from './ui/Placeholder';
import ContentEditable from './ui/ContentEditable';
import classNames from 'classnames';

import { useMutation } from '@tanstack/react-query';
import { checkCollab } from "@/services/api";
import type { TBody } from '@/types';
import { IData, ICollabTokenInfo } from '@/interfaces';
import ArticleHeader from '@/app/[locale]/(cms)/article/articleHeader';

import { useAtom } from "jotai";
import { collabTokenInfoAtom } from '@/store/articleData';


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
            try {
              const selection = $getSelection();
              // @ts-ignore
              const anchor = selection.anchor;
              // @ts-ignore
              const focus = selection.focus;
              if (typeof anchor != 'undefined' && typeof focus != 'undefined') {
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
                if (diff > 0) {
                  diff = diff > 28 ? diff : 28;
                  document.documentElement.scrollTop += diff;
                }
              }
            } catch(e) {

            }
          }
        });
      },
    );
  }, [editor, isEditable]);

  // 定时保存文章内容
  // const record2Html = useDebounce((editorState: EditorState) => {
  //   editorState.read(() => {
  //     const htmlString = $generateHtmlFromNodes(editor, null);
  //   });
  // }, 2000);

  // useEffect(() => {
  //   const removeUpdateListener = editor.registerUpdateListener(
  //     ({ editorState }) => {
  //       record2Html(editorState);
  //     }
  //   );
  //   return () => {
  //     removeUpdateListener();
  //   };
  // }, [editor]);

  // 检查collab token是否允许协同操作
  const [collabTokenInfo, setCollabTokenInfo] = useAtom(collabTokenInfoAtom);
  const checkCollabMutation = useMutation({
    mutationFn: async (variables: TBody<{token: string}>) => {
        return (await checkCollab(variables)) as IData<ICollabTokenInfo>;
    }
  });
  const checkCollabFunc = async () => {
    const search = window.location.search;
    const params = new URLSearchParams(search); 
    const token = params.get('t');
    if (token=="" || token==null || typeof token=='undefined') return;
    await checkCollabMutation.mutateAsync({data:{token: token ?? ""}}).then(res => {
      if (res.status == 200) {
        setCollabTokenInfo(prev => {
          return {...prev, ...res.data};
        });
      }
    });
  };
  useEffect(() => {
    setCollabTokenInfo({isCollab});
    checkCollabFunc();
  }, []);
  
  const CollaborationContent = React.useMemo(() => {
    return (
      collabTokenInfo.isCollab ? (
        <CollaborationPlugin
          id={collabTokenInfo.roomName!}
          cursorColor={collabTokenInfo.cursorColor!}
          username={collabTokenInfo.userName!}
          // @ts-ignore
          providerFactory={(id: string, yjsDocMap: Map<string, Doc>) => createWebsocketProvider(id, yjsDocMap, collabTokenInfo.token!, "main")}
          initialEditorState={null}
          shouldBootstrap={true}
        />
      ) : (
        <HistoryPlugin externalHistoryState={historyState} />
      )
    );
  }, [collabTokenInfo.isCollab]);
  
  return (
    <>
      <ArticleHeader checkCollabFunc={checkCollabFunc} />
      <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
      <div className={classNames('editor-container', {'mask': !isEditable})}>
          <>
            {!isEditable && (<div className="position-absolute top-50 start-50"><i className='iconfont icon-lock fs-2 opacity-25' /></div>)}
            {CollaborationContent}
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
            
            {/* block拖拉 */}
            {floatingAnchorElem && !isSmallWidthViewport && (
              <>
                <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
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
            <EquationsPlugin />
            <ExcalidrawPlugin />
          </>
      </div>
      <ActionTool />
    </>
  );
});
Editor.displayName = 'Editor';
export default Editor;
