/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import {CharacterLimitPlugin} from '@lexical/react/LexicalCharacterLimitPlugin';
import {CheckListPlugin} from '@lexical/react/LexicalCheckListPlugin';
import {ClearEditorPlugin} from '@lexical/react/LexicalClearEditorPlugin';
import LexicalClickableLinkPlugin from '@lexical/react/LexicalClickableLinkPlugin';
import {CollaborationPlugin} from '@lexical/react/LexicalCollaborationPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import {HashtagPlugin} from '@lexical/react/LexicalHashtagPlugin';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';

import useLexicalEditable from '@lexical/react/useLexicalEditable';
import * as React from 'react';
import {useEffect, useState} from 'react';
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
// import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin';
import {TablePlugin} from '@lexical/react/LexicalTablePlugin';
import TableCellResizer from './plugins/TableCellResizer';
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin';
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin';
import CommentPlugin from './plugins/CommentPlugin';
import {LayoutPlugin} from './plugins/LayoutPlugin/LayoutPlugin';
import VideoIframePlugin from './plugins/VideoIframePlugin';
// ui
import Placeholder from './ui/Placeholder';
import ContentEditable from './ui/ContentEditable';

// const skipCollaborationInit =
//   // @ts-expect-error
//   window.parent != null && window.parent.frames.right === window;

export default function Editor(): JSX.Element {
  const {historyState} = useSharedHistoryContext();
  const {
    settings: {
      isCollab,
      isAutocomplete,
      isMaxLength,
      isCharLimit,
      isCharLimitUtf8,
      showTreeView,
      showTableOfContents,
      shouldUseLexicalContextMenu,
      tableCellMerge,
      tableCellBackgroundColor,
    },
  } = useSettings();
  const isEditable = useLexicalEditable();
  
  const text = 'Enter some rich text...';
  const placeholder = <Placeholder>{text}</Placeholder>;
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false);
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

  return (
    <>
      <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
      <div
        className={`editor-container ${showTreeView ? 'tree-view' : ''}`}>
          <>
            <RichTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div className="editor" ref={onRef}>
                    <ContentEditable />
                  </div>
                </div>
              }
              placeholder={placeholder}
              ErrorBoundary={LexicalErrorBoundary}
            />
            {isMaxLength && <MaxLengthPlugin maxLength={10240} />}
            <DragDropPaste />
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
            <LayoutPlugin />
            {/* 视频iframe */}
            <VideoIframePlugin />
          </>
      </div>
      
    </>
  );
}
