import { authMiddleware } from '@/lib/api';
import {
  querySiteConfig,
} from '@/services/api';
import { cookies } from 'next/headers';
import Metadata from '@/lib/metadata';
import { customException, getMetadata } from '@/lib/tool';
import type { ISectionClient } from '@/interfaces';
import HomePage from '@/app/[locale]/home/home';
import ResetPage from '@/app/[locale]/reset/reset';
import type { Metadata as MetadataNext } from 'next';
// import HomeH5Page from '@/app/[locale]/mobile/home/h5';
import { createTranslator } from 'next-intl';
import { getMessages } from '@/lib/dictionaries';

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
  try {
    const token = authMiddleware(cookies());
    const req1 = querySiteConfig({
      token,
      query: {
        name: '/',
      },
    });

    const responses = await Promise.all([req1]);
    const resp1 = await ((await responses[0]) as Response).json();


    const sectionId = searchParams.sectionId ?? searchParams.sid;

    const metadata = new Metadata();
    metadata.set('period', [], determineTimePeriod());
    metadata.set('siteConfig', ['/site/info', ''], resp1.data);

    return (<HomePage metadata={metadata.toString()} />);
    // return searchParams.v === 'h5' ? (
    //   <HomeH5Page metadata={metadata.toString()} />
    // ) : (
    //   <HomePage metadata={metadata.toString()} />
    // );
  } catch (e) {
    console.log(e, "-----error-----")
    return <ResetPage error={e} />;
  }
}

const clientQuerySectionDetailsByIdReq = async ({
  searchParams,
  sections,
  token,
}: {
  searchParams: { sectionId?: string; sid?: string };
  sections: ISectionClient[];
  token: string | undefined;
}) => {
  const sectionId = searchParams.sectionId ?? searchParams.sid;
  if (!sectionId) {
    return;
  }

  const section = sections.find((value) => value.id === parseInt(sectionId));
  if (!section) {
    throw customException(404, '版块不存在');
  }

//   return clientQuerySectionDetailsById({
//     baseURL: process.env.APP_API_SERVER,
//     token,
//     id: sectionId,
//     query: searchParams,
//   });
};

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
