'use client';
import { FC, useRef, useEffect } from "react";
import { useTranslations } from 'next-intl';
import type { TBody, TMetadata } from '@/types';
import Footer from '../../../_layouts/siteFooter';
import { canEditAtom, writeArticleInitValue } from "@/store/articleData";
import { useAtom, useAtomValue } from 'jotai'
import { userDataAtom } from "@/store/userData";
import { getLocale } from 'next-intl/server';
import ContentLayout from "@/app/[locale]/_layouts/contentLayout";
import ArticleSetting from "../articleSetting";
// import "./newArticlePage.scss"
import RouteGuard from "@/app/[locale]/_common/routeGuard/index";
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
import { useSetAtom } from "jotai";
import { showLoginModalAtom, loginAtom } from "@/store/userData";

interface propsType {
  metadata: TMetadata;
}

const NewArticlePage: FC<propsType> = props => {
  const t = useTranslations('ArticleEditPage');

  let userData = useAtomValue(userDataAtom);
  const router = useRouter();

  const setShowLoginModal = useSetAtom(showLoginModalAtom);
  const [islogin, setLoginModal] = useAtom(loginAtom);

  const canEdit = useAtomValue(canEditAtom);
  console.log(canEdit, "===canEdit==");
  
  
  // const getArticleInfo = async (id: number) => {
  //   const articleInfo = await getCurrentArticleInfo({
  //       data: {articleId: id}
  //   }) as IData<any>;
  //   if( articleInfo?.status==200 ) {
  //     return articleInfo.data;
  //   } else if ( articleInfo.status==401 ) {
  //     // useErrRouter();
  //   }
  //   return null;
  // }
  
  const test = async () => {
    // try {
    //   let info = await getArticleInfo(1);
    //   console.log(info, "---s---")
    // } catch(ee) {
      
    // }

    // setLoginModal(!islogin);
    // setShowLoginModal("401");

  };

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
            
            <Footer metadata={props.metadata} />
            
          </>
        )
        : (
          <>
            {/* <NavbarPage metadata={props.metadata} fixedTop={true} /> */}
            <ContentLayout metadata={props.metadata} className="bg-white">
              <div className="w-100 d-flex justify-content-center align-items-center text-secondary">
                {t('loginPrompt')}
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
        <RichEditor metadata={props.metadata} />
        <ArticleSetting />
      </div>
      <div className="d-flex flex-row " style={{ marginBottom: '500px' }}>
      </div>
      
    </>
  );
};
