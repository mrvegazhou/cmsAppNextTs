import 'server-only';

const dictionaries: Record<string, () => Promise<IntlMessages>> = {
  en: () => import(`@/messages/en.json`).then((module) => module.default),
  zh: () => import(`@/messages/zh.json`).then((module) => module.default),
};

export async function getMessages(locale: string | undefined = 'zh') {
  try {
    const locales = process.env.APP_LOCALES!.split(',');
    let _locale = locale;
    if (!locales.includes(locale)) {
      _locale = process.env.APP_DEFAULT_LOCALE!;
    }
    return {
      locale: _locale,
      messages: await dictionaries[_locale](),
    };
  } catch (e) {
    const _locale = process.env.APP_DEFAULT_LOCALE!;
    return {
      locale: _locale,
      messages: await dictionaries[_locale](),
    };
  }
}
