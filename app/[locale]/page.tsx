import { cookies } from 'next/headers';
import Metadata from '@/lib/metadata';
import { customException, getMetadata } from '@/lib/tool';
import type { IData, ISiteConfig } from '@/interfaces';
import HomePage from '@/app/[locale]/home/home';
import ResetPage from '@/app/[locale]/reset/reset';
import type { Metadata as MetadataNext } from 'next';
// import HomeH5Page from '@/app/[locale]/mobile/home/h5';
import { createTranslator } from 'next-intl';
import { getMessages } from '@/lib/dictionaries';
import {
  getSiteConfig,
} from '@/services/api';

export async function generateMetadata({
  params: { locale },
}: {
  params: {
    locale: string;
  };
}): Promise<MetadataNext> {
  const t = createTranslator(await getMessages(locale));
  return getMetadata({ title: t('LocaleLayout.title') });
}


export default async function Page({
  params = {},
  searchParams = {},
}: {
  params: {};
  searchParams: { sectionId?: string; sid?: string; v?: 'h5' };
}) {
  // try {

    const pageInfo = await getSiteConfig({
      data: {uid: null}
    }) as Response;
    const responses = await Promise.all([pageInfo]);
    const resp1 = await ((await responses[0]) as Response).json();

    const metadata = new Metadata();
    metadata.set('period', [], determineTimePeriod());
    metadata.set('siteConfig', ['/site/info', ''], resp1.data.siteConfig);


    return (<HomePage metadata={metadata.toString()} />);
    // return searchParams.v === 'h5' ? (
    //   <HomeH5Page metadata={metadata.toString()} />
    // ) : (
    //   <HomePage metadata={metadata.toString()} />
    // );
  // } catch (e) {
  //   console.log(e, "-----error-----")
  //   return <ResetPage error={e} />;
  // }
}

const determineTimePeriod = () => {
  let period;
  const currentHour = new Date(Date.now()).getHours();
  if (currentHour >= 0 && currentHour < 6) {
    period = '午夜好';
  } else if (currentHour >= 6 && currentHour < 12) {
    period = '早上好';
  } else if (currentHour >= 12 && currentHour < 18) {
    period = '中午好';
  } else {
    period = '晚上好';
  }
  return period;
};
