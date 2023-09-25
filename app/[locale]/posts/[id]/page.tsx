import { authMiddleware } from '@/lib/api';

import { cookies, headers } from 'next/headers';
import Metadata from '@/lib/metadata';
import PostIdPage from '@/app/[locale]/posts/[id]/postid';
import ResetPage from '@/app/[locale]/reset/reset';
import { Metadata as MetadataNext } from 'next';
import type { IPostClientDetails } from '@/interfaces';
import { getMetadata } from '@/lib/tool';
import { notFound } from 'next/navigation';
// import PostIdH5Page from '@/app/[locale]/mobile/posts/[id]/h5';
import { createTranslator } from 'next-intl';
import { getMessages } from '@/lib/dictionaries';


export async function generateMetadata({
    params: { id, locale },
    searchParams = {},
  }: {
    params: { id?: string; locale: string };
    searchParams: {};
  }): Promise<MetadataNext> {
    if (!id) {
      notFound();
    }
  
    const t = createTranslator(await getMessages(locale));
  
    try {
      const token = authMiddleware(cookies());
    //   const response = clientQueryPostDetails({
    //     baseURL: process.env.APP_API_SERVER,
    //     token,
    //     id,
    //     query: searchParams,
    //   });
    //   const resp1 = await ((await response) as Response).json();
    //   const data = resp1.data as IPostClientDetails;
  
      return getMetadata({
        title: "",
        authors: {
          url: "",
          name: "",
        },
        creator: "",
        description: "",
      });
    } catch (e) {
      return getMetadata({ title: t('PostIdPage.articleDetails') });
    }
}

export default async function Page({
    params = {},
    searchParams = {},
  }: {
    params: { id?: string };
    searchParams: { v?: 'h5' };
  }) {
    if (!params.id) {
      notFound();
    }
  
    try {
      const token = authMiddleware(cookies());

      const metadata = new Metadata();
      metadata.set('page', ['/paths', '/'], "");
      metadata.set(
        'postId',
        [
          '/forum',
          '/posts',
          '/client',
          1,
          '/details',
          "",
          'infinite',
        ],
        "",
      );
      metadata.setReferer(headers().get('referer'));
      return searchParams.v === 'h5' ? (
        <PostIdPage metadata={metadata.toString()} />
      ) : (
        <PostIdPage metadata={metadata.toString()} />
      );
    } catch (e) {
      return <ResetPage error={e} />;
    }
}
