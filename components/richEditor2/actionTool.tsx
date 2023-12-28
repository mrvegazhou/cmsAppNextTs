import { useEffect, useState, useCallback, forwardRef, useRef } from "react";
import {$getRoot, $isParagraphNode, COMMAND_PRIORITY_EDITOR, CLEAR_EDITOR_COMMAND, $getSelection} from 'lexical';
import type {LexicalEditor} from 'lexical';
import {mergeRegister} from '@lexical/utils';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {CONNECTED_COMMAND} from '@lexical/yjs';
import { useTranslations } from 'use-intl';
import useModal from './hooks/useModal';
import DraftsEditor from "@/components/common/editor/draftsEditor";
import SaveEditor from "@/components/common/editor/saveEditor";
import ClearEditor from "@/components/common/editor/clearEditor";
import { CharCounter } from "@/lib/tool";

const scrollTo = () => {
  const curEl = document.getElementById('richEditor');
  curEl?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
};

const ActionTool = forwardRef((prop, ref): JSX.Element => {

    const t = useTranslations('ArticleEditPage');
    
    const [editor] = useLexicalComposerContext();
    const [isEditable, setIsEditable] = useState(() => editor.isEditable());
    const [connected, setConnected] = useState(false);
    
    let [wordsNum, setWordsNum] = useState<number>(0);
    let [linesNum, setLinesNum] = useState<number>(0);

    const [modal, showModal] = useModal();
    
    const clearEditorContent = useCallback(() => {
        showModal('清理编辑内容', (onClose) => (
            <ShowClearDialog editor={editor} onClose={onClose} />
        ));
    }, [editor, showModal]);

    useEffect(() => {
        return mergeRegister(
          editor.registerEditableListener((editable) => {
            setIsEditable(editable);
          }),
          editor.registerCommand<boolean>(
            CONNECTED_COMMAND,
            (payload) => {
              const isConnected = payload;
              setConnected(isConnected);
              return false;
            },
            COMMAND_PRIORITY_EDITOR,
          ),
        );
    }, [editor]);

    const [isEditorEmpty, setIsEditorEmpty] = useState(true);
    useEffect(() => {
        return editor.registerUpdateListener(
          ({dirtyElements, prevEditorState, tags}) => {
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

    return (
        <>
            <div id='xxx' className="fixed-bottom d-inline-flex justify-content-center align-items-center border-top bg-white" style={{height:"52px"}}>
                <small className="me-4 pe-3 text-secondary cursor-pointer" onClick={scrollTo}>{t('backToEditor')}</small>
                <small className="me-2 pe-2 text-secondary">{t('wordsCount')}:{wordsNum}</small>
                <small className="me-5 pe-5 text-secondary">{t('linesCount')}:{linesNum}</small>
                {/* 清空编辑 */}
                <ClearEditor class="ms-5" clearFn={clearEditorContent} isEmpty={isEditorEmpty} />
                {/* 保存到草稿 */}
                <DraftsEditor class="ms-3"></DraftsEditor>
                {/* 发布 */}
                <SaveEditor class="ms-3"></SaveEditor>
            </div>
            {modal}
        </>
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
            scrollTo();
          }} 
            className="btn btn-outline-primary me-4">确认</button>
          <button type="button" onClick={() => {editor.focus();onClose();}} className="btn btn-outline-secondary">取消</button>
        </div>
      </>
    );
}