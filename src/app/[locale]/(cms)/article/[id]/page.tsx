import dynamic from "next/dynamic";
import ResetPage from '../../../_common/reset/reset';
import { createTranslator } from 'next-intl';
import type { Metadata as MetadataNext } from 'next';
import { getMetadata } from '@/lib/tool';
import { authMiddleware } from '@/lib/api';
import { cookies } from 'next/headers';
import Metadata from '@/lib/metadata';
import ArticleIdPage from '@/app/[locale]/(cms)/article/[id]/articleId';
import { getCurrentArticleInfo, getArticleToolBarData } from '@/services/api';
import { IArticle, IData, IArticleToolBarData } from '@/interfaces';

const NotFound = dynamic(() => import("@/app/[locale]/(cms)/article/[id]/404"), { ssr: false });

export async function generateMetadata({
    params: { id, locale },
    searchParams = {},
  }: {
    params: { id?: number; locale: string };
    searchParams: {};
  }): Promise<MetadataNext> {
    
    // const t = createTranslator(await getMessages(locale));
    // try {
    //     const token = authMiddleware(cookies());

    //     return getMetadata({
    //         title: "title",
    //         authors: {
    //           url: 'www.baidu.com',
    //           name: "name",
    //         },
    //         creator: "createdBy",
    //         description: "description",
    //     });
    // } catch (e) {
    //     return getMetadata({ title: t('ArticleIdPage.articleDetails') });
    // }
    // 判断article id 是否存在
    return {
        title: "article title"
    }
}

const getArticleInfo = async (id: string) => {
    const articleInfo = await getCurrentArticleInfo({
        data: {articleId: id}
    }) as Response;
    let articleInfoRes = await articleInfo.json() as IData<IArticle>
    if( articleInfoRes?.status==200 && articleInfoRes?.data.id!=0) {
      return articleInfoRes.data;
    }
    return null;
}

export default async function Page({
    params,
    searchParams = {},
}: {
    params: { id?: string; locale: string };
    searchParams: { v?: 'h5' };
}) {
    try {
        let id = params.id;
        if (!id) {
            return <NotFound locale={params.locale}/>
        }
        // U2FsdGVkX19Uh1my%2BjUGwh8%2BtZDFgLBq4fp8SNFq0Es%3D
        let articleInfo = await getArticleInfo(decodeURIComponent(id));
        if (articleInfo==null) {
            return <NotFound locale={params.locale}/>
        }

        const metadata = new Metadata();
        metadata.set('page', "xxxx");
        metadata.set('postId', "ssss");

        return searchParams.v === 'h5' ? (
            <>
            h5
            </>
        ) : (
            <ArticleIdPage metadata={JSON.parse(JSON.stringify(metadata))} articleInfo={articleInfo} />
        );
    } catch (e) {
        return <ResetPage error={JSON.parse(JSON.stringify(e))} />;
    }
    
}