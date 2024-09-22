import { cookies } from 'next/headers';
import { authMiddleware } from '@/lib/api';
import Metadata from '@/lib/metadata';
import ResetPage from '../../../_common/reset/reset';
import NewArticlePage from './newArticlePage';
import { getLocale } from 'next-intl/server';
import { TMetadata } from '@/types';
import { Props } from '@/types/layout';

export default async function Page({
    params,
    searchParams = {},
}: Props & {
    searchParams: { v?: 'h5' }; 
}) {
    
    try {
        const locale = await getLocale();
        
        const metadata = new Metadata();
        metadata.setReferer('origin');
        metadata.setLocale(locale);
        
        return searchParams.v === 'h5' ? (
            <NewArticlePage metadata={JSON.parse(JSON.stringify(metadata))} />
        ) : (
            <NewArticlePage metadata={JSON.parse(JSON.stringify(metadata))} />
        );
    } catch (e) {
        console.log(e);
        return <>{JSON.stringify(e)}</>;
    }
}