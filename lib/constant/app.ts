export const TOKEN_NAME =
  process.env.NODE_ENV === 'production' && process.env.APP_URL_HTTPS === 'true'
    ? '__s_t'
    : '_t';
export const REFRESH_TOKEN_NAME =
  process.env.NODE_ENV === 'production' && process.env.APP_URL_HTTPS === 'true'
    ? '__s_rt'
    : '_rt';

export const SET_COOKIE = 'Set-Cookie';
export const LOCATION = 'location';
export const X_RATE_LIMIT_REMAINING = 'x-rate-limit-remaining';
export const X_RATE_LIMIT_RETRY_AFTER_MILLISECONDS =
  'x-rate-limit-retry-after-milliseconds';
export const X_POWERED_BY = 'x-powered-by';
export const CONTENT_TYPE = 'content-type';
export const X_POWERED_BY_HEADER = {
  [X_POWERED_BY]: 'www.youdeyiwu.com',
};

export const REFRESH_TOKEN_BUFFER = 10;

export const COOKIE_EXPIRES = 365;

export const SEND_EMAIL_CODE_MODE = "SEND_EMAIL_CODE";
export const CHANGE_PWD_MODEE = "CHANGE_PWD";

export const SITE_LOGIN_PAGE_INFO_TYPE = "LOGIN_PAGE_INFO";
export const SITE_REG_PAGE_INFO_TYPE = "REGISTER_PAGE_INFO";

export const BASE_URL = process.env.APP_API_SERVER ?? "http://localhost:3015";
export const SITE_CONFIG_URL = "/site/info";
export const GEN_CAPTCHA_URL = "/user/captcha/email";
export const LOGIN_BY_EMAIL = "/user/login/email";
export const GET_PASSWORD_PUBLIC_KEY = "/user/publicKey/password";
export const SEND_EMAIL_CODE = "/user/email/code";
export const CHANAGE_PWD_BY_EMAIL_CODE = "/user/change/newCode";
export const REGISTER_BY_EMAIL = "/user/register/email";
export const CAPTCHAT_GET = "/user/captcha/get";
export const CAPTCHAT_CHECK = "/user/captcha/check"
// 搜索bar
export const SEARCH_TRENDING_TODAY = "/user/search/trendingToday";
// 刷新token
export const REFRESH_TOKEN = "/user/refresh/token";
// 用户信息
export const USER_INFO = "/user/info";
// 登录页信息
export const PAGE_INFO = "/site/page/info";
