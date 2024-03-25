'use client';
import { FC, useRef, useEffect } from "react";
import { useTranslations } from 'next-intl';
import type { TBody, TMetadata } from '@/types';
import Footer from '../../../layouts/siteFooter';
import { writeArticleInitValue } from "@/store/articleData";
import { useAtomValue } from 'jotai'
import { userDataAtom } from "@/store/userData";
import { getLocale } from 'next-intl/server';
import ContentLayout from "@/app/[locale]/layouts/contentLayout";
import ArticleSetting from "../articleSetting";
// import "./newArticlePage.scss"
import RouteGuard from "@/app/[locale]/common/routeGuard/index";
import { staticRouter } from "@/lib/constant/router";
// import RichEditor from "@/components/richEditor2/App";


import dynamic from "next/dynamic";
const RichEditor = dynamic(() => import("@/components/richEditor2/App"), {
  ssr: false,
});

// import Calendar from "@/components/calendar";
// import BadgeComp from "@/components/badge/badge";

import { useMutation } from '@tanstack/react-query';
import { getCurrentArticleInfo } from "@/services/api";
import { IArticle, IData } from "@/interfaces";
import { useRouter } from 'next/navigation';


interface propsType {
  metadata: TMetadata;
}

const NewArticlePage: FC<propsType> = props => {
  let userData = useAtomValue(userDataAtom);
  const router = useRouter();

  
  useEffect(() => {
    const getArticleInfo = async (id: number) => {
      const articleInfo = await getCurrentArticleInfo({
          data: {articleId: id}
      }) as Response;
      let articleInfoRes = await articleInfo.json() as IData<IArticle>
      if( articleInfoRes?.status==200 ) {
        return articleInfoRes.data;
      }
      return null;
    }
    let info = getArticleInfo(1);
    console.log(info);
    
    if (info!=null) {

    }
  }, []);


  useEffect(() => {
    
  }, []);

  return (
    <>
      {true ?
        (
          <>
         
            {/* <RouteGuard locale={props.metadata.locale} back={staticRouter.articleNew}> */}
              <NewArticleEditor metadata={props.metadata} />
            {/* </RouteGuard> */}
            {/* <Footer metadata={props.metadata} /> */}
            
          </>
        )
        : (
          <>
            {/* <NavbarPage metadata={props.metadata} fixedTop={true} /> */}
            <ContentLayout metadata={props.metadata} className="bg-white">
              <div className="w-100 d-flex justify-content-center align-items-center text-secondary">
                请登录后再发布文章
              </div>
            </ContentLayout>
            <Footer metadata={props.metadata} />
          </>
        )}
    </>
  );
};
export default NewArticlePage;

const NewArticleEditor: FC<propsType> = props => {

  const t = useTranslations('ArticleEditPage');

  useEffect(() => {

}, []);

  return (
    <>
      <div className="w-100 px-0 mx-0">
        <RichEditor/>
        <ArticleSetting />
      </div>
      <div className="d-flex flex-row " style={{ marginBottom: '500px' }}>
      </div>
      
    </>
  );
};
