import { cookies } from 'next/headers';
import { authMiddleware } from '@/lib/api';
import Metadata from '@/lib/metadata';
import ResetPage from '@/app/[locale]/reset/reset';
import NewArticlePage from './newArticlePage';

export default async function Page({
    params = {},
    searchParams = {},
}: {
    params: {};
    searchParams: { v?: 'h5' };
}) {
    try {
        const token = authMiddleware(cookies());
        const metadata = new Metadata();
        metadata.setReferer('origin');
        return searchParams.v === 'h5' ? (
            <NewArticlePage metadata={metadata.toString()} />
        ) : (
            <NewArticlePage metadata={metadata.toString()} />
        );
    } catch (e) {
        return <ResetPage error={e} />;
    }
}