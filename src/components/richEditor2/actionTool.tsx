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
import { $generateHtmlFromNodes } from '@lexical/html';
import { canEditAtom } from "@/store/articleData";

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
        showModal(t('clearEditor'), (onClose) => (
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
    const canEditIdent = useAtomValue(canEditAtom);

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

    const test = () => {
      editor.update(() => {
        console.log($generateHtmlFromNodes(editor));
        console.log("-----------");
        console.log(JSON.stringify(editor.getEditorState()));
        
      });
    };
    

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
                  <ClearEditor isDisabled={!canEditIdent} class="ms-3" clearFn={clearEditorContent} isEmpty={isEditorEmpty} />
                  {/* 保存到草稿 */}
                  <SubmitEditor isDisabled={!canEditIdent} class="ms-3"></SubmitEditor>
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
    const t = useTranslations('ArticleEditPage');
    return (
      <>
        <div className="mb-3 text-center">
          {t('isClearEditContent')}
        </div>
        <div className='form-row text-center mt-4 mb-3'>
          <button type="button" onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
            editor.focus();
            onClose();
            scrollTo(true);
          }} 
            className="btn btn-outline-primary me-4">{t('btnConfirm')}</button>
          <button type="button" onClick={() => {editor.focus();onClose();}} className="btn btn-outline-secondary">{t('btnCancel')}</button>
        </div>
      </>
    );
}