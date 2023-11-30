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
  [X_POWERED_BY]: 'www.baidu.com',
};

// 上传图片限制
export const MAX_FILE_SIZE_IN_KB = 10000;

export const REFRESH_TOKEN_BUFFER = 10;

export const COOKIE_EXPIRES = 365;
export const TOKEN_SECRET = "TOKEN_SECRET";

export const SEND_EMAIL_CODE_MODE = "SEND_EMAIL_CODE";
export const CHANGE_PWD_MODEE = "CHANGE_PWD";

export const SITE_LOGIN_PAGE_INFO_TYPE = "LOGIN_PAGE_INFO";
export const SITE_REG_PAGE_INFO_TYPE = "REGISTER_PAGE_INFO";

export const BASE_URL = "http://localhost:3000/api";

// 图片展示
export const IMAGE_URL = "/image/static/";
export const GEN_CAPTCHA_URL = "/user/captcha/email";
export const LOGIN_BY_EMAIL = "/user/login/email";
export const LOGOUT_BY_EAMIL = "/user/logout/email";
export const GET_PASSWORD_PUBLIC_KEY = "/user/publicKey/password";
export const SEND_EMAIL_CODE = "/user/email/code";
export const CHANAGE_PWD_BY_EMAIL_CODE = "/user/change/newPassword";
export const REGISTER_BY_EMAIL = "/user/register/email";
export const CAPTCHAT_GET = "/user/captcha/get";
export const CAPTCHAT_CHECK = "/user/captcha/check"
// 搜索bar
export const SEARCH_TRENDING_TODAY = "/user/search/trendingToday";
// 刷新token
export const REFRESH_TOKEN = "/user/token/refresh";
// 用户信息
export const USER_INFO = "/user/info";
// app配置信息
export const SITE_CONFIG_URL = "/site/config/info";
// 登录页信息
export const PAGE_INFO = "/site/page/info";
// 获取具体的文章详情
export const CURRENT_ARTICLE_INFO = "/article/info";
// 文章点赞
export const ARTICLE_LIKE = "/article/like";
// 取消文章点赞
export const ARTICLE_UNLIKE = "/article/unlike";
// 获取文章tool bar信息
export const ARTICLE_TOOLBAR_DATA = "/article/toolBarData";
// 文章收藏
export const ARTICLE_COLLECTION = "/article/collection";
//  图片上传
export const ARTICLE_UPLOAD_IMAGE = "/article/uploadImage";
