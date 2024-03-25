export const defaultLocale: string = process.env.DEFAULT_LOCALE || 'zh';
export const locales: string[] = process.env.LOCALES ? (process.env.LOCALES).split(",") : ['en', 'zh'];
export const timeZone = process.env.TIME_ZONE || 'UTC';
export const localePrefix = undefined;