import * as React from 'react';
import { useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes } from '@lexical/html';
import Avatar from "../../../(auth)/login/avatar";
import InviteCollab from "../inviteCollab";
import { debounce } from "lodash"
import { useAtom } from 'jotai'
import { writeArticleAtom } from "@/store/articleData";
import { useInterval } from 'ahooks';
import { useTranslations } from 'next-intl';
import "./index.scss";

export default function ArticleHeader(props: {
  checkCollabFunc: Function;
}): JSX.Element {
  const t = useTranslations('ArticleEditPage');

  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounce(() => {
      setArticleData(pre => {
        return { ...pre, title: e.target.value };
      });
    }, 500)();
  };

  const [saveLocalState, setSaveLocalState] = useState<string>();

  const [articleData, setArticleData] = useAtom(writeArticleAtom);

  const [editor] = useLexicalComposerContext();
  // 获取富文本编辑的内容
  const handleSave2Html = () => {
    let content = "";
    editor.update(() => {
      const htmlString = $generateHtmlFromNodes(editor, null);
      content = htmlString
    });
    return content;
  };

  useInterval(() => {
    setSaveLocalState(t('savingStatus'));
    if (articleData.createTime) {
        
    }
    // @ts-ignore
    let contentTmp = handleSave2Html();
    setArticleData(pre => {
      return {...pre, content: contentTmp};
    });
    setTimeout(() => {setSaveLocalState(t('savedStatus')); }, 1000);
  }, 300000); // 五分钟间隔


  return (
    <>
      <div id="richEditorHeader" className="d-flex justify-content-between align-items-center border-bottom" style={{ height: "50px" }}>
        <div className="pe-4">
          <a href="#" className="text-decoration-none" title={t('goHome')}>
            <i className="iconfont icon-shouye ms-3 fs-3 text-secondary"></i>
          </a>
        </div>
        <input
          placeholder={t('enterArticleTitle')}
          onChange={handleTitle}
          className="input-placeholder w-100 border-0 fs-5 shadow-none min-vw-50 text-left "
          style={{ outline: "none" }}
          spellCheck="false"
          maxLength={300}
        />
        <small className="text-secondary text-nowrap">{saveLocalState}</small>
        <small className="ms-3 text-secondary text-nowrap">
          <InviteCollab checkCollabFunc={props.checkCollabFunc}/>
        </small>
        <Avatar class="me-4 ms-4" />
      </div>
    </>
  );
}


