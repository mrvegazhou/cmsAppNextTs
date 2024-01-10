'use client';
import { useEffect, FC, useState, useRef } from "react";
import { useRecoilValue, useRecoilState } from "recoil";
import { useTranslations } from 'use-intl';
import type { TMetadata } from '@/types';
import { NavbarPage } from '@/app/[locale]/navbar';
import FooterPage from '@/app/[locale]/footer';
import { writeArticleContext, writeArticleInitValue } from "@/store/articleData";
import { userDataContext } from "@/store/userData";
import ContentLayout from "../../common/contentLayout";
import { debounce } from "lodash"
import RichEditor from "@/components/richEditor2/App";
import ArticleTag from "../articleTag";
import ArticleType from "../aritcleType";
import ArticleCover from "../articleCover";
import "./newArticlePage.scss"
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
        (<NewArticleEditor metadata={props.metadata} />)
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
  const [articleData, setArticleData] = useRecoilState(writeArticleContext);

  useEffect(() => {

  }, []);


  const handleTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounce(() => {
      setArticleData(pre => {
        return {...pre, ...{title: e.target.value}};
      });
    }, 500)();
  };

  const handleDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    debounce(() => {
      setArticleData(pre => {
        return {...pre, ...{description: e.target.value}};
      });
    }, 500)();
  };

  return (
    <>
      <div className="w-100 px-0 mx-0">
        <div id="richEditorHeader" className="d-flex justify-content-between align-items-center border-bottom" style={{ height: "50px" }}>
          <div className="pe-4">
            <a href="#" className="text-decoration-none" title="返回首页">
              <i className="iconfont icon-shouye ms-3 fs-3 text-secondary"></i>
            </a>
          </div>
          <input
            placeholder="输入文章标题..."
            onChange={handleTitle}
            className="input-placeholder w-100 border-0 fs-5 shadow-none min-vw-50 text-center "
            style={{ outline: "none" }}
            spellCheck="false"
            maxLength={300}
          />
          <small className="text-secondary text-nowrap">{t('savedStatus')}</small>
          <Avatar class="me-4 ms-4" />
        </div>

        <RichEditor ref={editorRef} />

        <div className="card mx-auto my-5" style={{ maxWidth: '1000px' }}>
          <div className="card-header">
            设置
          </div>
          <div className="card-body mb-3">
            <div className="row mt-4 d-flex flex-row align-items-center justify-content-center">
              <div className="col-2 text-end">
                封面
              </div>
              <div className="col-10">
                <ArticleCover init={false} />
              </div>
            </div>
            <div className="row mt-4 d-flex flex-row align-items-center justify-content-center">
              <div className="col-2 text-end">
                <span className="text-danger">*</span>分类
              </div>
              <div className="col-10">
                <div className="d-flex text-muted">
                  <ArticleType init={false} />
                </div>
              </div>
            </div>
            <div className="row mt-4 d-flex flex-row align-items-center justify-content-center">
              <div className="col-2 text-end">
                <span className="text-danger">*</span>标签
              </div>
              <div className="col-10">
                <div className="d-flex text-muted flex-wrap">
                  <ArticleTag init={true} />
                </div>
              </div>
            </div>
            <div className="row mt-4 d-flex flex-row align-items-center justify-content-center">
              <div className="col-2 text-end">
                摘要
              </div>
              <div className="col-10">
                <textarea className="form-control" style={{ height: '100px', width: '600px' }} onChange={handleDescription}></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: '500px' }}>

      </div>
    </>
  );
};