import Metadata from '@/lib/metadata';
import RegisterPage from '@/app/[locale]/register/register';
import ResetPage from '@/app/[locale]/reset/reset';
import { Metadata as MetadataNext } from 'next';
import { getMetadata } from '@/lib/tool';
// import RegisterH5Page from '@/app/[locale]/register/h5';
import { createTranslator } from 'next-intl';
import { getMessages } from '@/lib/dictionaries';
import { SITE_REG_PAGE_INFO_TYPE } from '@/lib/constant';
import { getPageInfo } from '@/services/api/siteInfo';
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
    return getMetadata({ title: "注册" });
}

const getRegPageInfo = async () => {
  const pageInfoRes = await getPageInfo({
    data: {type: SITE_REG_PAGE_INFO_TYPE}
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
      // 获取注册页的介绍
      const pageInfo = await getRegPageInfo();  

      const metadata = new Metadata();
      metadata.set('page', ['/paths', '/register'], "");
      return (<RegisterPage metadata={metadata.toString()} pageInfo={pageInfo}/>);
    } catch (e) {
        return <ResetPage error={e} />;
    }
}

