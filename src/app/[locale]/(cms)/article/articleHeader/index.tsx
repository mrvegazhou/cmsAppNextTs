import * as React from 'react';
import { useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useMutation } from '@tanstack/react-query';
import Avatar from "../../../(auth)/login/avatar";
import InviteCollab from "../inviteCollab";
import { debounce } from "lodash"
import { useAtom, useAtomValue } from 'jotai'
import { writeArticleAtom } from "@/store/articleData";
import { useInterval } from 'ahooks';
import { useTranslations } from 'next-intl';
import dayjs from 'dayjs';
import "./index.scss";
import { TBody } from '@/types';
import { saveArticleDraft } from '@/services/api';
import { IArticle, IArticleDraft, IData } from '@/interfaces';
import { canEditAtom } from '@/store/articleData';
import { CLIENT_TPYES, SAVE_TYPE } from '@/lib/constant';
import { getUserAgent } from '@/lib/tool';


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
  const canEdit = useAtomValue(canEditAtom);
  const [articleData, setArticleData] = useAtom(writeArticleAtom);

  const [editor] = useLexicalComposerContext();
  // 获取富文本编辑的内容
  const handleSaveNodes = () => {
    let content = "";
    editor.update(() => {
      // const htmlString = $generateHtmlFromNodes(editor, null);
      content = JSON.stringify(editor.getEditorState())
    });
    return content;
  };

  // 自动保存草稿到数据库
  const saveDraftMutation = useMutation({
    mutationFn: async (variables: TBody<IArticleDraft>) => {
      return await saveArticleDraft(variables) as IData<IArticle>;
    }
  });

  useInterval(() => {
    if (!canEdit) return;
    setSaveLocalState(t('savingStatus'));
    if (articleData.createTime) {
      // 小于五分钟不执行
      if (dayjs(articleData.createTime).diff(Date.now(), 'minute') <= 5) {
        return;
      }
    }
    let newContent = handleSaveNodes();
    // 检查缓存的内容和目前的内容是否相等
    const os = getUserAgent();
    let sourceType = "";
    if (os.isAndroid || os.isPhone) {
      sourceType = CLIENT_TPYES.WAP;
    } else if (os.isTablet) {
      sourceType = CLIENT_TPYES.TABLET;
    } else if (os.isPc) {
      sourceType = CLIENT_TPYES.PC;
    }
    // 
    if (dayjs(articleData.createTime).diff(Date.now(), 'minute') >= 15) {
      let draftInfo = {
        articleId: articleData.id,
        title: articleData.title,
        content: articleData.content,
        coverUrl: articleData.coverImage.src,
        isSetCatalog: articleData.isSetCatalog,
        tags: articleData.tags,
        typeId: articleData.typeId,
        sourceType: sourceType,
        saveType: SAVE_TYPE.AUTO
      } as IArticleDraft;
      if (articleData.content !== newContent) {
        saveDraftMutation.mutateAsync({ data: draftInfo }).then(res => {
          if (res.status==200 && res.data.id!=0) {
            setArticleData(pre => {
              return { ...pre, id: res.data.id };
            });
          }
          console.log(res, "===draft====");
        });
      }
    }

    setArticleData(pre => {
      return { ...pre, content: newContent, createTime: dayjs(Date.now()).format('YYYY-MM-DD HH:mm:ss') };
    });
    setTimeout(() => { setSaveLocalState(t('savedStatus')); }, 1000);

  }, 300000); // 五分钟间隔

  React.useEffect(() => {

  }, [])


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
          <InviteCollab checkCollabFunc={props.checkCollabFunc} />
        </small>
        <Avatar class="me-4 ms-4" />
      </div>
    </>
  );
}


