import { use } from "react";
import Metadata from '@/lib/metadata';
import LoginPage from './login';
import ResetPage from '../../_common/reset/reset';
import { Metadata as MetadataNext } from 'next';
import { getMetadata } from '@/lib/tool';
import { createTranslator } from 'next-intl';
import { getPageInfo } from '@/services/api';
import { SITE_LOGIN_PAGE_INFO_TYPE } from '@/lib/constant';
import type {
  IData,
  IPageInfo
} from '@/interfaces';

// export async function generateMetadata({
//     params: { locale },
//   }: {
//     params: {
//       locale: string;
//     };
//   }): Promise<MetadataNext> {
//     const t = createTranslator(await getMessages(locale));
//     let data = {
//       title: t('LoginPage.userLogin'),
//       description: ""
//     }
//     return getMetadata(data);
// }

const getLoginPageInfo = async () => {
  const pageInfo = await getPageInfo({
    data: {type: SITE_LOGIN_PAGE_INFO_TYPE}
  }) as Response;
  let pageInfoRes = await pageInfo.json() as IData<IPageInfo>
  if( pageInfoRes?.status==200 ) {
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
        // const pageInfo = await getLoginPageInfo();
      // console.log(pageInfo, "===pageInfo===");
      
        const metadata = new Metadata();
        metadata.setReferer("");

        return searchParams.v === 'h5' ? (
            <LoginPage metadata={JSON.parse(JSON.stringify(metadata))} pageInfo={null} />
        ) : (
            <LoginPage metadata={JSON.parse(JSON.stringify(metadata))} pageInfo={null}/>
        );

    } catch (e) {
        return <ResetPage error={JSON.parse(JSON.stringify(e))} />;
    }
}