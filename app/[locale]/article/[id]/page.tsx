import dynamic from "next/dynamic";
import ResetPage from '@/app/[locale]/reset/reset';
import { createTranslator } from 'next-intl';
import type { Metadata as MetadataNext } from 'next';
import { getMessages } from '@/lib/dictionaries';
import { getMetadata } from '@/lib/tool';
import { authMiddleware } from '@/lib/api';
import { cookies } from 'next/headers';
import Metadata from '@/lib/metadata';
import ArticleIdPage from '@/app/[locale]/article/[id]/articleId';
import { getCurrentArticleInfo, getArticleToolBarData } from '@/services/api';
import { IArticle, IData, IArticleToolBarData } from '@/interfaces';

const NotFound = dynamic(() => import("@/app/[locale]/article/[id]/404"), { ssr: false });

export async function generateMetadata({
    params: { id, locale },
    searchParams = {},
  }: {
    params: { id?: number; locale: string };
    searchParams: {};
  }): Promise<MetadataNext> {
    
    const t = createTranslator(await getMessages(locale));
    try {
        const token = authMiddleware(cookies());

        return getMetadata({
            title: "title",
            authors: {
              url: 'www.baidu.com',
              name: "name",
            },
            creator: "createdBy",
            description: "description",
        });
    } catch (e) {
        return getMetadata({ title: t('ArticleIdPage.articleDetails') });
    }
}

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

const getArticleToolBar = async (id: number) => {
    const toolBarData = await getArticleToolBarData({ data: {articleId: id} }) as Response;
    let toolBarRes = await toolBarData.json() as IData<IArticleToolBarData>
    if( toolBarRes?.status==200 ) {
      return toolBarRes.data;
    }
    return {isLiked: false, isCollected: false, favorites: {} };
}

export default async function Page({
    params,
    searchParams = {},
}: {
params: { id?: number; locale: string };
searchParams: { v?: 'h5' };
}) {
    let id = Number(params.id);
    if (!id || isNaN(id)) {
        return <NotFound locale={params.locale}/>
    }
    let articleInfo = await getArticleInfo(id);
    if (articleInfo==null) {
        return <NotFound locale={params.locale}/>
    }

    let toolBarData = await getArticleToolBar(id);

    const metadata = new Metadata();
    metadata.set('page', ['/paths', '/'], "xxxx");
    metadata.set(
      'postId',
      [
        '/forum',
        '/posts',
        '/client',
        params.id,
        '/details',
        searchParams,
        'infinite',
      ],
        "ssss",
    );
    try {
        return searchParams.v === 'h5' ? (
            <>
            h5
            </>
        ) : (
            <ArticleIdPage metadata={metadata.toString()} articleInfo={articleInfo} toolBarData={toolBarData}/>
        );
    } catch (e) {
        return <ResetPage error={e} />;
    }
    
}