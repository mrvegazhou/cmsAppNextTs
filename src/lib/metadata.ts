import type { QueryKey } from '@tanstack/query-core';
import type { TEnv } from '@/types';

export default class Metadata {
  all: {
    [alias: string]: {
      v: unknown;
    };
  };

  env: TEnv;

  referer: string | null;

  locale: string;

  constructor(alias?: string, qk?: QueryKey, data?: unknown) {
    this.all = {};
    this.env = {
      APP_NAME: process.env.APP_NAME,
      APP_NAME_ABBR: process.env.APP_NAME_ABBR,
      APP_URL: process.env.APP_URL,
      APP_URL_HOST: process.env.APP_URL_HOST,
      APP_URL_HTTPS: process.env.APP_URL_HTTPS,
      APP_DESCRIPTION: process.env.APP_DESCRIPTION,
      APP_OSS_SERVER: process.env.APP_OSS_SERVER,
      APP_BLUR_DATA_URL: process.env.APP_BLUR_DATA_URL,
      APP_ICP_NUM: process.env.APP_ICP_NUM,
      APP_ICP_LINK: process.env.APP_ICP_LINK,
      MIXPANEL: process.env.MIXPANEL,
      MIXPANEL_DEBUG: process.env.MIXPANEL_DEBUG,
      MIXPANEL_PROJECT_TOKEN: process.env.MIXPANEL_PROJECT_TOKEN,
      PLAUSIBLE: process.env.PLAUSIBLE,
      PLAUSIBLE_TRACK_LOCAL_HOST: process.env.PLAUSIBLE_TRACK_LOCAL_HOST,
      PLAUSIBLE_DATA_DOMAIN: process.env.PLAUSIBLE_DATA_DOMAIN,
      PLAUSIBLE_DATA_API_DOMAIN: process.env.PLAUSIBLE_DATA_API_DOMAIN,
      UMAMI: process.env.UMAMI,
      UMAMI_SRC: process.env.UMAMI_SRC,
      UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID,
      UMAMI_DATA_CACHE: process.env.UMAMI_DATA_CACHE,
      UMAMI_DATA_HOST_URL: process.env.UMAMI_DATA_HOST_URL,
      APP_DEFAULT_LOCALE: process.env.APP_DEFAULT_LOCALE,
      APP_LOCALES: process.env.APP_LOCALES,
    };
    this.referer = null;
    this.locale = process.env.DEFAULT_LOCALE!

    if (alias && qk && data) {
      this.set(alias, data);
    }
  }

  get(alias: string) {
    return this.all[alias];
  }

  set(alias: string, data: unknown) {
    if (!data) {
      return;
    }

    this.all[alias] = {
      v: data,
    };
  }

  setReferer(referer: string | null) {
    this.referer = referer;
  }

  setLocale(locale: string) {
    this.locale = locale;
  }

  toString() {
    return {
      all: this.all,
      env: this.env,
      referer: this.referer,
    };
  }
}
