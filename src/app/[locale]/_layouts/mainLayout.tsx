import '@/styles/global.scss';
import React from 'react';
import { Props } from '@/types/layout';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import Wrapper from './wrapperLayout';

export default function MainLayout({ children, params: { locale } }: Props) {
    
    const messages = useMessages();
    return (
        <NextIntlClientProvider locale={locale} messages={messages}>
            <Wrapper locale={locale!}>
                {children}
            </Wrapper>
        </NextIntlClientProvider>
    );
}