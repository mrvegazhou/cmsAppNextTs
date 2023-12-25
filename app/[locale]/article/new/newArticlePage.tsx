'use client';

import { useEffect, FC, useState } from "react";
import { useRecoilValue, useResetRecoilState } from "recoil";
import { useTranslations } from 'use-intl';
import type { TMetadata } from '@/types';
import { NavbarPage } from '@/app/[locale]/navbar';
import FooterPage from '@/app/[locale]/footer';
import { writeArticleContext, writeArticleInitValue } from "@/store/articleData";
import { userDataContext } from "@/store/userData";
import ContentLayout from "../../common/contentLayout";
import { IArticle } from "@/interfaces";
import DraftsEditor from "../../common/editor/draftsEditor";
import SaveEditor from "../../common/editor/saveEditor";
import dynamic from 'next/dynamic';
import { SkeletonLayout } from "@/components/skeleton/layout";
import Editor from "@/components/richEditor2/App";
import RichEditor from "@/components/richEditor/richEditor";
import Modal from "@/components/modal";

const MarkdownEditor = dynamic(() => import('../../common/editor/makedownEditor'), {
  ssr: false,
  loading: () => <SkeletonLayout
                        align="center"
                        items={[
                          { height: 20, width: '90%', marginBottom: 30 },
                          { height: 20, width: '90%', marginBottom: 30 },
                          { height: 20, width: '90%', marginBottom: 30 },
                          { height: 20, width: '90%', marginBottom: 30 },
                          { height: 20, width: '90%', marginBottom: 30 },
                        ]}
                      />,
})
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
  let [articleData, setArticleData] = useState<IArticle>();
  let resetArticleData = useResetRecoilState(writeArticleContext);
  let [wordsNum, setWordsNum] = useState<number>(0);
  let [linesNum, setLinesNum] = useState<number>(0);
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
        <div className="">
          {/* <header className="d-flex justify-content-between align-items-center" style={{height:"4rem"}}>
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
          </header> */}
          <div className="d-flex mr-5">
            <Editor />
          </div>
          <hr className="simple mx-3 text-muted" />
        
          <div className="" style={{height:"500px"}}></div>
          
        </div>
       
        <div className="fixed-bottom d-inline-flex justify-content-center align-items-center border-top bg-white" style={{height:"52px"}}>

          <small className="me-4 pe-3">{t('backToTop')}</small>
          <small className="me-2 pe-2 text-secondary">{t('wordsCount')}:{wordsNum}</small>
          <small className="me-5 pe-5 text-secondary">{t('linesCount')}:{linesNum}</small>
          <DraftsEditor class="ms-5"></DraftsEditor>
          <SaveEditor class="ms-3"></SaveEditor>
        </div>
        
      </div>
    </>
  );
};