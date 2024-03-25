
// import { Inter } from 'next/font/google'
// import { getMetadata } from '@/lib/tool';
import classNames from 'classnames';

import { timeZone, locales } from '@/lib/constant/locales';
import HomePage from '../(home)/home/home';
import {getTranslations, unstable_setRequestLocale} from 'next-intl/server';
import {ReactNode} from 'react';

// export function generateStaticParams() {
//   return locales.map((locale) => ({locale}));
// }

// export async function generateMetadata({
//   params: {locale}
// }: Omit<Props, 'children'>) {
  
//   const t = await getTranslations({locale, namespace: 'LocaleLayout'});
//   console.log(t, "==t===");
  
//   return {
//     title: t('title')
//   };
// }


export default async function Layout({
  children,
  params: { locale },
}: {
  children: React.ReactNode,
  params: { locale: string };
}) {
  
  return (
    <>
      {children}
    </>
  )
}
