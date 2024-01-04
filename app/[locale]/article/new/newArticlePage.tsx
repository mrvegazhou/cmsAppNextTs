'use client';

import { useEffect, FC, useState, useRef, useCallback } from "react";
import { useRecoilValue, useResetRecoilState } from "recoil";
import { useTranslations } from 'use-intl';
import type { TMetadata } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { NavbarPage } from '@/app/[locale]/navbar';
import FooterPage from '@/app/[locale]/footer';
import { writeArticleContext, writeArticleInitValue } from "@/store/articleData";
import { userDataContext } from "@/store/userData";
import ContentLayout from "../../common/contentLayout";
import { IArticle } from "@/interfaces";
import RichEditor from "@/components/richEditor2/App";
import type { TBody } from '@/types';
import type { IData } from '@/interfaces';
import { getArticleTypeList } from "@/services/api";
import { IArticleTypeList } from "@/interfaces";
import Menu from '@/components/menu/Menu';
import { debounce } from "lodash"
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
  let [articleData, setArticleData] = useState<IArticle>();
  let resetArticleData = useResetRecoilState(writeArticleContext);

  // 显示添加分类按钮
  let [showAddType, setShowAddType] = useState(false);
  let [typeList, setTypeList] = useState<IArticleTypeList[]>([]);
  let [typeName, setTypeName] = useState<string>("");

  // 获取文章类型列表
  const getArticleTypeListMutation = useMutation(
    async (variables: TBody<{ typeName: string }>) => {
      return (await getArticleTypeList(variables)) as IData<IArticleTypeList[]>;
    },
  );

  const getArticleTypeMenus = useCallback(() => {
    if (getArticleTypeListMutation.isLoading) {
      return <></>;
    }
    if (!showAddType && typeList.length > 0) {
      return (<Menu bordered style={{ maxWidth: 200 }}>
        {typeList.map((item, idx) => {
          return <Menu.Item text={item.name} />;
        })}
      </Menu>);
    }
  }, [getArticleTypeListMutation, showAddType, typeList]);

  const debouncedSearch = debounce(async (name) => {
    await getArticleTypeListMutation.mutateAsync({
      data: {
        typeName: name
      }
    }).then(res => {
      if (res.status == 200) {
        setTypeList(res.data);
      }
    });
  }, 300);

  const searchTypeList = async (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  useEffect(() => {

  }, []);


  const handleTitle = () => {

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
                <div className="d-flex text-muted">
                  <div className="article-type-label">
                    <div className="article-type-name">一个人的生活xxxxxxxxxx</div>
                    <div className="article-type-btn">
                      <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Zm-6.47-3.53a.75.75 0 0 1 0 1.06L13.06 12l2.47 2.47a.75.75 0 1 1-1.06 1.061L12 13.061l-2.47 2.47a.75.75 0 1 1-1.06-1.061L10.939 12l-2.47-2.469a.75.75 0 1 1 1.061-1.06L12 10.94l2.47-2.47a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                  </div>
                  {showAddType ? (
                    <div className="article-type-input">
                      <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" d="M11.8 2.425a9.075 9.075 0 1 0 5.62 16.201l2.783 2.783a.875.875 0 1 0 1.238-1.237l-2.758-2.758A9.075 9.075 0 0 0 11.8 2.425ZM4.475 11.5a7.325 7.325 0 1 1 14.65 0 7.325 7.325 0 0 1-14.65 0Z" clip-rule="evenodd"></path>
                      </svg>
                      <input className="" placeholder="搜索话题..." onChange={searchTypeList}></input>
                      {getArticleTypeMenus()}
                      <div className="article-type-input-btn">
                        <svg width="1.2em" height="1.2em" viewBox="0 0 24 24" fill="currentColor">
                          <path fill-rule="evenodd" d="M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10Zm-6.47-3.53a.75.75 0 0 1 0 1.06L13.06 12l2.47 2.47a.75.75 0 1 1-1.06 1.061L12 13.061l-2.47 2.47a.75.75 0 1 1-1.06-1.061L10.939 12l-2.47-2.469a.75.75 0 1 1 1.061-1.06L12 10.94l2.47-2.47a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"></path>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="article-type-add fs-6 text-muted" onClick={() => { setShowAddType(true); }}>
                      <svg width="14px" height="14px" viewBox="0 0 24 24" className="" fill="currentColor">
                        <path fill-rule="evenodd" d="M13.25 3.25a1.25 1.25 0 1 0-2.5 0v7.5h-7.5a1.25 1.25 0 1 0 0 2.5h7.5v7.5a1.25 1.25 0 1 0 2.5 0v-7.5h7.5a1.25 1.25 0 0 0 0-2.5h-7.5v-7.5Z" clip-rule="evenodd">
                        </path>
                      </svg>
                      添加话题
                    </div>
                  )}

                </div>
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
      <div style={{ marginBottom: '500px' }}>

      </div>
    </>
  );
};