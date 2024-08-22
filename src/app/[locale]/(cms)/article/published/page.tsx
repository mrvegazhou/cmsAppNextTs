import { cookies } from 'next/headers';
import { authMiddleware } from '@/lib/api';
import Metadata from '@/lib/metadata';
import ResetPage from '../../../_common/reset/reset';
import ArticlePublished from './index';
import { getLocale } from 'next-intl/server';
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
        metadata.setLocale(locale);
        
        return searchParams.v === 'h5' ? (
            <ArticlePublished metadata={JSON.parse(JSON.stringify(metadata))} />
        ) : (
            <ArticlePublished metadata={JSON.parse(JSON.stringify(metadata))} />
        );
    } catch (e) {
        return <ResetPage error={JSON.parse(JSON.stringify(e))} />;
    }
}