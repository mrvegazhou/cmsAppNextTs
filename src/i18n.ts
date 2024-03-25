import { getRequestConfig } from "next-intl/server";
import { notFound } from 'next/navigation';
import { locales } from "./lib/constant/locales";
// import deepmerge from "deepmerge";
// import type { AbstractIntlMessages } from "next-intl";
// import zh from '../messages/zh.json'
// import en from '../messages/en.json'
export default getRequestConfig(async ({ locale }) => {

    if (!locales.includes(locale as any)) notFound();

    return {
        messages: (
            await (locale === 'zh'
              ? // When using Turbopack, this will enable HMR for `en`
                import('../messages/zh')
              : import(`../messages/${locale}`))
        ).default
    };
});

