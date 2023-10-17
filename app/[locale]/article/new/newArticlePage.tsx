'use client';

import { useEffect, FC } from "react";
import { useRecoilValue, useResetRecoilState } from "recoil";
import type { TMetadata } from '@/types';
import { NavbarPage } from '@/app/[locale]/navbar';
import FooterPage from '@/app/[locale]/footer';
import { writeArticleContext, writeArticleInitValue } from "@/store/articleData";
import { userDataContext } from "@/store/userData";
import ContentLayout from "../../common/contentLayout";
import useSetState from "@/hooks/useSetState";
import { IArticle } from "@/interfaces";

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
  let [articleData, setArticleData] = useSetState<IArticle>();
  let resetArticleData = useResetRecoilState(writeArticleContext);

  useEffect(() => {
    return () => {
      resetArticleData();
    };
  }, [resetArticleData]);

  return (
    <div className="w-100">
      <div>
        <header className="h-12 flex justify-between items-center">
          <input
              placeholder="输入文章标题..."
              value=""
              className="mr-10 h-full"
              onChange={e => setArticleData(_data => ({ ..._data, title: e.target.value }))}
              maxLength={200}
            />
        </header>
        <div className="flex mr-5">

        </div>
      </div>
      <div className=""></div>
      <div className="fixed-bottom">
        
      </div>
      
      {/* <a className="btn btn-primary" data-bs-toggle="offcanvas" data-bs-target="#offcanvasScrolling" aria-controls="offcanvasScrolling">
        Link with href
      </a>
      <div className="offcanvas offcanvas-start" data-bs-scroll="true" data-bs-backdrop="false" id="offcanvasScrolling" aria-labelledby="offcanvasScrollingLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasScrollingLabel">Colored with scrolling</h5>
          <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <p>Try scrolling the rest of the page to see this option in action.</p>
        </div>
      </div> */}
    </div>
  );
};