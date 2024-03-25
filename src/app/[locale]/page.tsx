import { cookies } from 'next/headers';
import Metadata from '@/lib/metadata';
import { customException, getMetadata } from '@/lib/tool';
import type { IData, ISiteConfig } from '@/interfaces';
import HomePage from './(home)/home/home';
// import ResetPage from '@/app/[locale]/reset/reset';
import type { Metadata as MetadataNext } from 'next';
// import HomeH5Page from '@/app/[locale]/mobile/home/h5';
import { createTranslator } from 'next-intl';
import { getSiteConfig } from '@/services/api';

interface Props {
  params: {},
  searchParams: { v?: 'h5' };
}

export default async function Page({ params }: Props) {
  
  try {
    
    const pageInfo = await getSiteConfig({
      data: {uid: null}
    }) as Response;
    const responses = await Promise.all([pageInfo]);
    const resp1 = await ((await responses[0]) as Response).json();

    const metadata = new Metadata();
    metadata.set('siteConfig', "xxx");

    return (<HomePage metadata={JSON.parse(JSON.stringify(metadata))}/>);

    // return searchParams.v === 'h5' ? (
    //   <HomeH5Page metadata={metadata.toString()} />
    // ) : (
    //   <HomePage metadata={metadata.toString()} />
    // );
  } catch (e) {
    // return <ResetPage error={e} />;
  }
}
