import React from 'react';
import { Props } from '@/types/layout';
import MainLayout from './_layouts/mainLayout';

export default function Layout({ children, params: { locale } }: Props) {
    
    return (
        <html lang={locale} data-bs-theme="auto">
            <body suppressHydrationWarning={true} className='mainBgColor'>
                <MainLayout params={{locale: locale}}>{children}</MainLayout>
            </body>
        </html>
    );
}