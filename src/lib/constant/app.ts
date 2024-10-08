export const TOKEN_NAME =
  process.env.NODE_ENV === 'production' && process.env.APP_URL_HTTPS === 'true'
    ? '__t'
    : '__t';
export const REFRESH_TOKEN_NAME =
  process.env.NODE_ENV === 'production' && process.env.APP_URL_HTTPS === 'true'
    ? '__rt'
    : '__rt';

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
// 评论常数
export const COMMENT_WORDS_LIMIT = 1000;
export const COMMENT_IMGS_LIMIT = 1;
export const REPORT_DESC_WORD_LIMIT = 500;
// 客户端类型
export const CLIENT_TPYES = {
  WAP: 'wap',
  PC: 'pc',
  TABLET: 'tablet',
};
// 文章保存方式
export const SAVE_TYPE = {
  MANUAL: 1,
  AUTO: 2,
};
// 密码强度
export const PWD_STRENGTH = {
  WEAK: 1,
  MEDIUM: 2,
  STRONG: 3,
};
// 文章字数
export const ARTICLE_WORDS_LIMIT = 140;
// 上传图片限制
export const MAX_FILE_SIZE_IN_KB = 10000;

export const REFRESH_TOKEN_BUFFER = 3600;

export const COOKIE_EXPIRES = 365;
export const TOKEN_SECRET = "0123456789abcdef";

export const SEND_EMAIL_CODE_MODE = "SEND_EMAIL_CODE";
export const CHANGE_PWD_MODEE = "CHANGE_PWD";

export const SITE_LOGIN_PAGE_INFO_TYPE = "LOGIN_PAGE_INFO";
export const SITE_REG_PAGE_INFO_TYPE = "REGISTER_PAGE_INFO";

export const BASE_URL = "http://localhost:3000/api";
export const API_URL = "http://localhost:3015/api";
// 图片展示
export const IMAGE_URL = "/image/static/";
export const PERSONAL_IMAGE_URL =  IMAGE_URL + "p/"; 
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
// 通过名称搜用户列表
export const SEARCH_USER_LIST = "/user/search/name";
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
// 图片列表
export const PERSONAL_IMAGE_LIST = "/image/personalImageList";
// 删除图片
export const DELETE_IMAGE_BY_ID = "/image/deleteById";
// 上传评论、回复、举报图片
export const UPLOAD_IMAGE = "/image/upload";
// tag
export const APP_TAG_LIST = "/tag/list";
// 分类
export const APP_TYPE_LIST = "/type/list";
// 根据pid获取分类列表
export const APP_TYPE_PID = "/type/pid";
// 根据id获取分类列表
export const APP_TYPE_ID = "/type/id";
// 协作
export const INVITE_COLLAB = "/article/collab/invite";
// 退出协作
export const EXIT_COLLAB = "/article/collab/exit"
// 文章协作列表
export const COLLAB_VIEW = "/article/collab/view"
// 检查协作
export const CHECK_COLLAB = "/article/collab/check";
// 保存文章草稿
export const SAVE_DRAFT = "/article/save/draft";
// 提交文章
export const SAVE_ARTICLE = "/article/save/article";
// 草稿列表
export const ARTICLE_DARFT_HISTORY = "/article/draft/history";
// 草稿信息
export const ARTICLE_DARFT_INFO = "/article/draft/info";
// 保存文章评论
export const SAVE_ARTICLE_COMMENT = "/article/save/comment";
// 保存回复评论
export const SAVE_ARTICLE_REPLY = "/article/save/reply";
// 文章评论列表
export const ARTICLE_COMMENT_LIST = "/article/comment/list";
// 评论回复列表
export const ARTICLE_COMMENT_REPLY_LIST = "/article/reply/list";
// 举报原因
export const REPORT_REASON_LIST = "/report/reason/list"
// 举报
export const SEND_REPORT = "/report/send/reason"