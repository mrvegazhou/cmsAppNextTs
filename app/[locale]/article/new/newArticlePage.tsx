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
import "./newArticlePage.scss"

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

  return (
    <>
      <style jsx>{`
        .input-placeholder::placeholder {
          color: #6c757d !important;
          font-size: 1rem;
          font-weight: 400;
        }
      `}</style>
      <div className="w-100 px-0 mx-0">
        <div id="richEditorHeader" className="d-flex justify-content-between align-items-center border-bottom" style={{height:"50px"}}>
          <div className="pe-4">
            <a href="#" className="text-decoration-none" title="返回首页">
              <i className="iconfont icon-shouye ms-3 fs-3 text-secondary"></i>
            </a>
          </div>
          <input
              placeholder="输入文章标题..."
              onChange={handleTitle}
              className="input-placeholder w-100 border-0 fs-5 shadow-none min-vw-50 text-center "
              style={{outline:"none"}}
              spellCheck="false"
              maxLength={300}
            />
          <small className="text-secondary text-nowrap">{t('savedStatus')}</small>
          <Avatar class="me-4 ms-4"/>
        </div>

        <RichEditor ref={editorRef}/>

        <div className="card mx-auto my-5" style={{maxWidth: '1000px'}}>
          <div className="card-header">
            设置
          </div>
          <div className="card-body mb-3">
            <div className="row mt-4 d-flex flex-row align-items-center justify-content-center">
              <div className="col-2 text-end">
                封面
              </div>
              <div className="col-10">
                <label className="add-img-label">
                  <input type="file" accept=".jpeg, .jpg, .png" className="d-none" />
                  <div className="add-cover-img">
                    <svg width="14" height="14" viewBox="0 0 24 24" className="me-2" fill="currentColor">
                      <path fillRule="evenodd" d="M13.25 3.25a1.25 1.25 0 1 0-2.5 0v7.5h-7.5a1.25 1.25 0 1 0 0 2.5h7.5v7.5a1.25 1.25 0 1 0 2.5 0v-7.5h7.5a1.25 1.25 0 0 0 0-2.5h-7.5v-7.5Z" clipRule="evenodd"></path>
                    </svg>
                    添加文章封面
                  </div>
                </label>
                <small className="text-muted">图片上传格式支持 JPEG、JPG、PNG</small>
              </div>
            </div>
            <div className="row mt-4 d-flex flex-row align-items-center justify-content-center">
              <div className="col-2 text-end">
                <span className="text-danger">*</span>分类
              </div>
              <div className="col-10">
                <input type="text" className="form-control ms-2" placeholder="Last name" aria-label="Last name" />
              </div>
            </div>
            <div className="row mt-4 d-flex flex-row align-items-center justify-content-center">
              <div className="col-2 text-end">
                标签
              </div>
              <div className="col-10">
                <input type="text" className="form-control ms-2" placeholder="Last name" aria-label="Last name" />
              </div>
            </div>
            <div className="row mt-4 d-flex flex-row align-items-center justify-content-center">
              <div className="col-2 text-end">
                摘要
              </div>
              <div className="col-10">
               <span className="w-x5 bg-black">ss</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{marginBottom: '500px'}}>

      </div>
    </>
  );
};