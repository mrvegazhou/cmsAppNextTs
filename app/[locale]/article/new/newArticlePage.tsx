'use client';

import { useEffect, FC, useState, useRef, useCallback } from "react";
import { useRecoilValue, useResetRecoilState } from "recoil";
import { useTranslations } from 'use-intl';
import type { TMetadata } from '@/types';
import { NavbarPage } from '@/app/[locale]/navbar';
import FooterPage from '@/app/[locale]/footer';
import { writeArticleContext, writeArticleInitValue } from "@/store/articleData";
import { userDataContext } from "@/store/userData";
import ContentLayout from "../../common/contentLayout";
import { IArticle } from "@/interfaces";
import RichEditor from "@/components/richEditor2/App";

// const Editor = dynamic(() => import('@/components/richEditor2/App'), {
//   ssr: false,
//   loading: () => <SkeletonLayout
//                         align="center"
//                         items={[
//                           { height: 20, width: '90%', marginBottom: 30 },
//                           { height: 20, width: '90%', marginBottom: 30 },
//                           { height: 20, width: '90%', marginBottom: 30 },
//                           { height: 20, width: '90%', marginBottom: 30 },
//                           { height: 20, width: '90%', marginBottom: 30 },
//                         ]}
//                       />,
// })
import Avatar from "../../login/avatar";


type articleContextType = typeof writeArticleInitValue;

interface propsType {
  metadata: TMetadata;
}

const NewArticlePage: FC<propsType> = props => {
    let userData = useRecoilValue(userDataContext) 
    return (
      <>
      {userData ?
         ( <NewArticleEditor metadata={props.metadata} /> )
        : (
          <>
            <NavbarPage metadata={props.metadata} fixedTop={true} />
            <ContentLayout metadata={props.metadata} className="bg-white">
              <div className="w-100 d-flex justify-content-center align-items-center text-secondary">
                请登录后再发布文章
              </div>
            </ContentLayout>
            <FooterPage metadata={props.metadata} />
          </>
        )}
      </>
    );
};
export default NewArticlePage;

const NewArticleEditor: FC<propsType> = props => {

  const t = useTranslations('ArticleEditPage');
  const editorRef = useRef(null);
  let [articleData, setArticleData] = useState<IArticle>();
  let resetArticleData = useResetRecoilState(writeArticleContext);

  let [switchEditor, setSwitchEditor] = useState<string>("RichEditor");

  useEffect(() => {
    return () => {
      resetArticleData();
    };
  }, [resetArticleData]);

  useEffect(() => {
    
  }, []);

  const handleTitle = () => {

  };

  const handleSwitchEditor = () => {
    if( switchEditor=="MarkdownEditor" ) {
      setSwitchEditor("RichEditor");
    } else {
      setSwitchEditor("MarkdownEditor");
    }
  };

  return (
    <>
      <div className="w-100 px-0 mx-0">

          <header id="richEditorHeader" className="d-flex justify-content-between align-items-center border-bottom" style={{height:"4rem"}}>
            <div className="pe-4">
              <a href="#" className="text-decoration-none" title="返回首页">
                <i className="iconfont icon-shouye ms-3 fs-3 text-secondary"></i>
              </a>
            </div>
            <input
                placeholder="输入文章标题..."
                value=""
                onChange={handleTitle}
                className="w-100 border-0 fs-5 shadow-none fw-bold min-vw-50"
                style={{outline:"none"}}
                spellCheck="false"
                maxLength={200}
              />
            <small className="text-secondary text-nowrap">{t('savedStatus')}</small>
            <i className="iconfont icon-qiehuan fs-4 text-black-50 opacity-75 ms-3 me-2 cursor-pointer" onClick={handleSwitchEditor} title={t('switchEditor')}></i>
            <Avatar class="me-4 ms-4"/>
          </header>

          <RichEditor ref={editorRef}/>

        
          <div className="" style={{height:"500px"}}></div>
          
      </div>
    </>
  );
};