import { use } from "react";
import Metadata from '@/lib/metadata';
import LoginPage from '@/app/[locale]/login/login';
import ResetPage from '@/app/[locale]/reset/reset';
import { Metadata as MetadataNext } from 'next';
import { getMetadata } from '@/lib/tool';
import { createTranslator } from 'next-intl';
import { getMessages } from '@/lib/dictionaries';
import { getPageInfo } from '@/services/api';
import { SITE_LOGIN_PAGE_INFO_TYPE } from '@/lib/constant';
import type {
  IData,
  IPageInfo
} from '@/interfaces';

export async function generateMetadata({
    params: { locale },
  }: {
    params: {
      locale: string;
    };
  }): Promise<MetadataNext> {
    const t = createTranslator(await getMessages(locale));
    let data = {
      title: t('LoginPage.userLogin'),
      description: ""
    }
    return getMetadata(data);
}

const getLoginPageInfo = async () => {
  const pageInfoRes = await getPageInfo({
    data: {type: SITE_LOGIN_PAGE_INFO_TYPE}
  }) as IData<IPageInfo>;
  if( pageInfoRes?.code==200 ) {
    return pageInfoRes.data;
  }
  return null;
}

export default async function Page({
    params = {},
    searchParams = {},
  }: {
    params: {};
    searchParams: {
      v?: 'h5';
    };
  }) {
    try {
        // 获取登录页的介绍
        const pageInfo = await getLoginPageInfo();

        const metadata = new Metadata();

        return searchParams.v === 'h5' ? (
            // <LoginH5Page metadata={metadata.toString()} />
            <LoginPage metadata={metadata.toString()} pageInfo={pageInfo} />
        ) : (
            <LoginPage metadata={metadata.toString()} pageInfo={pageInfo}/>
        );

    } catch (e) {
        return <ResetPage error={e} />;
    }
}