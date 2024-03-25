import '@/app/globals.css';
import React from 'react';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { Props } from '@/types/layout';
import { timeZone } from '@/lib/constant/locales';


export const metadata: { title: string, description: string } = {
    title: 'React Next Admin',
    description: '',
};

export default function EmptyLayout({ children, params: { locale } }: Props) {
    const messages = useMessages();
    return (
        <NextIntlClientProvider locale={locale} messages={messages} timeZone={timeZone}>
            {children}
        </NextIntlClientProvider>
    );
}
