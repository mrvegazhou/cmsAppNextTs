import React from 'react';
import { Props } from '@/types/layout';
import MainLayout from './_layouts/mainLayout';

export default function Layout({ children, params: { locale } }: Props) {
    console.log(locale, "222===locale===");
    
    return (
        <html lang={locale} data-bs-theme="auto">
            <body suppressHydrationWarning={true}>
                <MainLayout params={{locale: locale}}>{children}</MainLayout>
            </body>
        </html>
    );
}