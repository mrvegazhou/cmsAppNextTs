import { getLocale } from 'next-intl/server';
import Metadata from '@/lib/metadata';
import ErrorPage from '../../_common/error/error';

export default async function Page({
    params = {},
    searchParams = {},
}: {
    params: {};
    searchParams: { v?: 'h5' };
}) {
    
    const locale = await getLocale();
    const metadata = new Metadata();
    metadata.setReferer('origin');
    metadata.setLocale(locale);

    return (
        <ErrorPage />
    );
}