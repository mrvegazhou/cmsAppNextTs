export type TBody<T=any> = RequestInit & {
  baseURL?: string;
  token?: string;
  data?: T;
  query?: Record<any, any>;
  type?: 'formData';
};

export type TMessageType =
  | 'SUCCESS'
  | 'DANGER'
  | 'INFO'
  | 'PRIMARY'
  | 'SECONDARY'
  | 'WARNING'
  | 'LIGHT';

export type TEnv = {
  APP_NAME: string | undefined;
  APP_NAME_ABBR: string | undefined;
  APP_URL: string | undefined;
  APP_URL_HOST: string | undefined;
  APP_URL_HTTPS: string | undefined;
  APP_DESCRIPTION: string | undefined;
  APP_OSS_SERVER: string | undefined;
  APP_BLUR_DATA_URL: string | undefined;
  APP_ICP_NUM: string | undefined;
  APP_ICP_LINK: string | undefined;
  MIXPANEL: string | undefined;
  MIXPANEL_DEBUG: string | undefined;
  MIXPANEL_PROJECT_TOKEN: string | undefined;
  PLAUSIBLE: string | undefined;
  PLAUSIBLE_DATA_DOMAIN: string | undefined;
  PLAUSIBLE_DATA_API_DOMAIN: string | undefined;
  PLAUSIBLE_TRACK_LOCAL_HOST: string | undefined;
  UMAMI: string | undefined;
  UMAMI_SRC: string | undefined;
  UMAMI_WEBSITE_ID: string | undefined;
  UMAMI_DATA_CACHE: string | undefined;
  UMAMI_DATA_HOST_URL: string | undefined;
  APP_DEFAULT_LOCALE: string | undefined;
  APP_LOCALES: string | undefined;
};

export type TMetadata = {
  all: {
    [alias: string]: { v: unknown; };
  };
  env: TEnv;
  referer: string | null;
  locale: string;
};

export type HexObject = {
  [key: string]: number[];
};

export type Point = {
  x: number;
  y: number;
}