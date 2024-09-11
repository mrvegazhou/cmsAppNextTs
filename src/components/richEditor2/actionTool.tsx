import { useEffect, useState, useCallback, forwardRef, useMemo, useImperativeHandle, useRef, useLayoutEffect } from "react";
import {$getRoot, $isParagraphNode, CLEAR_EDITOR_COMMAND, $insertNodes, $parseSerializedNode} from 'lexical';
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
import { canEditAtom } from "@/store/articleData";
import type { TMetadata } from '@/types';


import { useAtom } from "jotai";
import { writeArticleAtom } from "@/store/articleData";


const scrollTo = (again: boolean) => {
  const curEl = document.getElementById('richEditorHeader');
  curEl?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  again && setTimeout(() => {
    curEl?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 300)
};

interface propsType {
  metadata: TMetadata;
}

const ActionTool = forwardRef((prop: propsType, ref): JSX.Element => {

    const t = useTranslations('ArticleEditPage');

    const [returnWhere, setReturnWhere] = useState('top');
    useEffect(() => {
      const options = {
        threshold: .5, //目标元素与视窗重叠的阈值（0~1）
        root:null // 目标视窗即目标元素的父元素，如果没有提供，则默认body元素
      };    
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          // 元素可见
          if (entry.isIntersecting) {
            setReturnWhere('bottom');
          } else {
            setReturnWhere('top');
          }
        });
      }, options);
      const target = document.getElementById('richEditor');
      if (target) {
        observer.observe(target!);
      }
    }, []);
    const onScrollTo = () => {
      if (returnWhere=='bottom') {
        const curEl = document.getElementById('articleSetting');
        curEl?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
      } else {
        scrollTo(false);
      }
    };
    
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

    const [articleData, setArticleData] = useAtom(writeArticleAtom);
    useLayoutEffect(() => {
      editor.update(() => {
        const htmlString = articleData.content;
        const parser = new DOMParser();
        const dom = parser.parseFromString(htmlString, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const rootNode = $getRoot();
        rootNode.clear();
        for (const node of nodes) {
          try {
              rootNode.append(node);
          } catch (err) {
              continue;
          }
        }
      });
    }, []);

    // 显示标注按钮
    const collabTokenInfo = useAtomValue(collabTokenInfoAtom);
    const canEditIdent = useAtomValue(canEditAtom);

    const CommentContent = useMemo(() => {
      return (
        collabTokenInfo.isCollab ?
        (<CommentPlugin 
          roomName={collabTokenInfo.roomName!}
          // @ts-ignore
          providerFactory={(id: string, yjsDocMap: Map<string, Doc>) => createWebsocketProvider(collabTokenInfo.roomName!, yjsDocMap, collabTokenInfo.token!, "comment", collabTokenInfo.user)} />
        ) :
        (<CommentPlugin />)
      );
    }, [collabTokenInfo.isCollab]);

    const test = async () => {
      
      // let rawContent = '{"root":{"children":[{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"ssss","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"mark","version":1,"ids":["ydnfq"]}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""},{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"cc","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}';
      // editor.setEditorState(editor.parseEditorState(rawContent));

      // editor.getEditorState().read(() => {
      //   // const rootNode = $getRoot();
      //   // const text = $getRoot().getTextContent();
      //   console.log($generateHtmlFromNodes(editor, null), '--rawContent--');
      // });
      // return
     
      return

      editor.update(() => {

        console.log($generateHtmlFromNodes(editor, null), '---11---');
        console.log(JSON.stringify(editor.getEditorState()), '---22---');
        
        // let nodetext = {"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"xxxx","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}};

        // const htmlString = '<p class="PlaygroundEditorTheme__paragraph"><br></p><iframe data-lexical-videoiframe="//player.bilibili.com/player.html?bvid=BV1tx4y147kz&amp;page=1&amp;high_quality=1&amp;danmaku=0&amp;autoplay=0" data-lexical-videoiframe-type="BILIBILI" width="560" height="315" src="//player.bilibili.com/player.html?bvid=BV1tx4y147kz&amp;page=1&amp;high_quality=1&amp;danmaku=0&amp;autoplay=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="true" title="video iframe"></iframe><p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">sss</span></p>'//$generateHtmlFromNodes(editor, null);
        const htmlString ='<p class="PlaygroundEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">sss </span><mark id="1,22"><span class="PlaygroundEditorTheme__textUnderline" style="white-space: pre-wrap;">ppp</span></mark></p>';
        const parser = new DOMParser();
        const dom = parser.parseFromString(htmlString, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        
        const rootNode = $getRoot();
        rootNode.clear();
        for (const node of nodes) {
            try {
              console.log(node, '---11s--')
                rootNode.append(node);
            } catch (err) {
                continue;
            }
        }
        // $insertNodes(nodes);
        // const markdown = $convertToMarkdownString(ELEMENT_TRANSFORMERS);

        // console.log(markdown, '---markdown---');

        
      }, {discrete: true});
      
    };

    const submitEditorRef = useRef(null);
    const saveDrafts = () => {
      if (submitEditorRef.current) {
        // @ts-ignore
        submitEditorRef.current.saveDrafts();
      }
    }; 
    useImperativeHandle(ref, () => ({ saveDrafts: saveDrafts }));

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
                  <small className="me-4 pe-3 text-primary cursor-pointer" onClick={() => {onScrollTo();} }>{returnWhere=='top' ? t('backToEditor') : t('backToSetting') }</small>
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
                  <SubmitEditor metadata={prop.metadata} ref={submitEditorRef} isDisabled={!canEditIdent} class="ms-3"></SubmitEditor>
                  <div onClick={test}>test</div>
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