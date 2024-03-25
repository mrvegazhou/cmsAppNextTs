import { useEffect, useState, useCallback, forwardRef, useMemo } from "react";
import {$getRoot, $isParagraphNode, CLEAR_EDITOR_COMMAND} from 'lexical';
import type {LexicalEditor} from 'lexical';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import { useTranslations } from 'next-intl';
import useModal from '@/hooks/useModal/show';
import SubmitEditor from "@/components/common/editor/submitEditor";
import HistoryEditor from "../common/editor/historyEditor";
import ClearEditor from "@/components/common/editor/clearEditor";
import { CharCounter } from "@/lib/tool";

import CommentPlugin from './plugins/CommentPlugin';
import {createWebsocketProvider} from './collaboration';
import { useAtomValue } from 'jotai';
import { collabTokenInfoAtom } from '@/store/articleData';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';

const scrollTo = (again: boolean) => {
  const curEl = document.getElementById('richEditorHeader');
  curEl?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  again && setTimeout(() => {
    curEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 300)
};

const ActionTool = forwardRef((prop, ref): JSX.Element => {

    const t = useTranslations('ArticleEditPage');
    
    const [editor] = useLexicalComposerContext();
    const [isEditable, setIsEditable] = useState(() => editor.isEditable());
    
    let [wordsNum, setWordsNum] = useState<number>(0);
    let [linesNum, setLinesNum] = useState<number>(0);

    const [modal, showModal] = useModal();
    
    const clearEditorContent = useCallback(() => {
        showModal('清理编辑内容', (onClose) => (
            <ShowClearDialog editor={editor} onClose={onClose} />
        ));
    }, [editor, showModal]);

    const [isEditorEmpty, setIsEditorEmpty] = useState(true);
    useEffect(() => {
        return editor.registerUpdateListener(
          () => {
            editor.getEditorState().read(() => {
              const root = $getRoot();
              const children = root.getChildren();
              if (children.length > 1) {
                setIsEditorEmpty(false);
              } else {
                if ($isParagraphNode(children[0])) {
                  const paragraphChildren = children[0].getChildren();
                  setIsEditorEmpty(paragraphChildren.length === 0);
                } else {
                  setIsEditorEmpty(false);
                }
              }
              setLinesNum(root.getAllTextNodes().length);
              let content = root.getTextContent();
              setWordsNum(CharCounter(content));
            });
          },
        );
    }, [editor, isEditable]);

    // 显示标注按钮
    const collabTokenInfo = useAtomValue(collabTokenInfoAtom);
    

    const test = () => {
      editor.update(() => {
        console.log($generateHtmlFromNodes(editor));
        console.log(JSON.stringify(editor.getEditorState()));
        
        const parser = new DOMParser();
        const dom = parser.parseFromString('<p class="PlaygroundEditorTheme__paragraph" dir="ltr"><u><s><span class="PlaygroundEditorTheme__textUnderlineStrikethrough" style="white-space: pre-wrap;">ttttt</span></s></u></p><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">xxxxxx</span></p><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">xxxxxx</span></p>', 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        console.log(nodes[1].exportDOM(editor));
        
      });


      editor.update(() => {
        // In the browser you can use the native DOMParser API to parse the HTML string.
        const parser = new DOMParser();
        const dom = parser.parseFromString('<p class="PlaygroundEditorTheme__paragraph" dir="ltr"><u><s><span class="PlaygroundEditorTheme__textUnderlineStrikethrough" style="white-space: pre-wrap;">ttttt</span></s></u></p><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">xxxxxx</span></p><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">xxxxxx</span></p>', 'text/html');
      
        // Once you have the DOM instance it's easy to generate LexicalNodes.
        const nodes = $generateNodesFromDOM(editor, dom);
      
        // Select the root
        $getRoot().select();
        // const selection = $getSelection();
        // Insert them at a selection.
        // $insertNodes(nodes);
      });
    };

    const CommentContent = useMemo(() => {
      return (
        collabTokenInfo.isCollab ?
        (<CommentPlugin 
          roomName={collabTokenInfo.roomName!}
          // @ts-ignore
          providerFactory={(id: string, yjsDocMap: Map<string, Doc>) => createWebsocketProvider(collabTokenInfo.roomName!, yjsDocMap, collabTokenInfo.token!, "comment")} />
        ) :
        (<CommentPlugin />)
      );
    }, [collabTokenInfo.isCollab]);
    

    return (
        <div className="fixed-bottom text-center border-top bg-white w-100">
            <div id='xxx' className="d-inline-flex justify-content-around align-items-center mx-auto flex-nowrap" style={{height:"52px", maxWidth:"1000px", width: "1000px"}}>
                <div className="justify-content-start align-items-center d-flex flex-nowrap w-50">
                  <small className="me-2 pe-2 text-secondary">{t('wordsCount')}:{wordsNum}</small>
                  <small className="me-4 pe-4 text-secondary">{t('linesCount')}:{linesNum}</small>
                  
                  <small className="me-4 text-primary cursor-pointer">
                    {/* 注解 */}
                    {CommentContent}
                  </small>

                  <small className="me-4 text-primary cursor-pointer"><HistoryEditor /></small>
                  <small className="me-4 pe-3 text-primary cursor-pointer" onClick={() => { scrollTo(false)} }>{t('backToEditor')}↑</small>
                </div>
                <div className="justify-content-end align-items-center d-flex flex-nowrap w-50">
                  <i className={`cursor-pointer ms-5 fs-4 text-secondary iconfont ${!isEditable ? 'icon-unlock' : 'icon-lock'}`} 
                    onClick={() => {
                      // Send latest editor state to commenting validation server
                      if (isEditable) {
                        // sendEditorState(editor);
                      }
                      editor.setEditable(!editor.isEditable());
                    }}
                  />
                  {/* 清空编辑 */}
                  <ClearEditor class="ms-3" clearFn={clearEditorContent} isEmpty={isEditorEmpty} />
                  {/* 保存到草稿 */}
                  <SubmitEditor class="ms-3"></SubmitEditor>
                  <div onClick={test}>测试</div>
                </div>
            </div>
            {modal}
        </div>
    );
});
ActionTool.displayName = 'ActionTool';
export default ActionTool;


export function ShowClearDialog({
    editor,
    onClose,
  }: {
    editor: LexicalEditor;
    onClose: () => void;
  }): JSX.Element {
    
    return (
      <>
        <div className="mb-3 text-center">
          确定要清除编辑内容吗?
        </div>
        <div className='form-row text-center mt-4 mb-3'>
          <button type="button" onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
            editor.focus();
            onClose();
            scrollTo(true);
          }} 
            className="btn btn-outline-primary me-4">确认</button>
          <button type="button" onClick={() => {editor.focus();onClose();}} className="btn btn-outline-secondary">取消</button>
        </div>
      </>
    );
}