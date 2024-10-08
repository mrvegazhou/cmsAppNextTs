import type { TBody } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import type { 
  IData, 
  IArticle, 
  IArticleId, 
  IArticleCollabView, 
  ICollabTokenInfo, 
  IArticleDraft, 
  IArticleToolBarData 
} from '@/interfaces';
import { 
    CURRENT_ARTICLE_INFO,
    ARTICLE_LIKE,
    ARTICLE_UNLIKE,
    ARTICLE_TOOLBAR_DATA,
    COLLAB_VIEW,
    EXIT_COLLAB,
    INVITE_COLLAB,
    CHECK_COLLAB,
    SAVE_DRAFT,
    SAVE_ARTICLE,
    ARTICLE_DARFT_HISTORY,
    ARTICLE_DARFT_INFO,
    API_URL
} from '@/lib/constant';
import { fetch as refreshFetch } from "@/lib/api/refreshFetch";


const API_BASE_URL = API_URL;

export const getCurrentArticleInfo = (
  params: TBody<IArticleId>
): Promise<Response | IData<IArticle>> => {
  let config = createConfig(params, {
    method: 'POST', 
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });
  const url = config.baseURL + CURRENT_ARTICLE_INFO;
  return fetch(url, config).then(
    handleReqMiddleware
  );
};

export const doArticleLike = (
  params: TBody<IArticleId>
): Promise<Response | IData<any>> => {
  let config = createConfig(params, {
    method: 'POST', 
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
  }});
  const url = config.baseURL + ARTICLE_LIKE;
  return refreshFetch(url, config).then(
    handleReqMiddleware
  );
};

export const doArticleUnlike = (
  params: TBody<IArticleId>
): Promise<Response | IData<any>> => {
  let config = createConfig(params, {
    method: 'POST',
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
  }});
  const url = config.baseURL + ARTICLE_UNLIKE;
  return refreshFetch(url, config).then(
    handleReqMiddleware
  );
};

export const getArticleToolBarData = (
  params: TBody<IArticleId>
): Promise<Response | IData<IArticleToolBarData>> => {
  let config = createConfig(params, { method: 'POST', baseURL: API_BASE_URL});
  const url = config.baseURL + ARTICLE_TOOLBAR_DATA;
  return refreshFetch(url, config).then(
    handleReqMiddleware
  );
};

export const collabViewList = (
  params?: TBody
): Promise<Response | IData<IArticleCollabView>> => {
  let config = createConfig(params, {method: "POST", baseURL: API_BASE_URL});
  return refreshFetch(config.baseURL + COLLAB_VIEW, config).then(
    handleReqMiddleware
  );
};

export const exitCollab = (
  params: TBody<{token: string}>
): Promise<Response | IData<boolean>> => {
  let config = createConfig(params, {
    method: 'POST', 
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
  }});
  const url = config.baseURL + EXIT_COLLAB;
  return refreshFetch(url, config).then(
    handleReqMiddleware
  );
};

export const inviteCollab = (
  params?: TBody<{userIds: number[]; article: number; expireName: string}>
): Promise<Response | IData<string>> => {
  let config = createConfig(params, {method: "POST", baseURL: API_BASE_URL});
  return refreshFetch(config.baseURL + INVITE_COLLAB, config).then(
    handleReqMiddleware
  );
};

// 检查collab token是否允许协同操作
export const checkCollab = (
  params: TBody<{token: string}>
): Promise<Response | IData<ICollabTokenInfo>> => {
  let config = createConfig(params, {method: "POST", baseURL: API_BASE_URL});
  return refreshFetch(config.baseURL + CHECK_COLLAB, config).then(
    handleReqMiddleware
  );
};

export const saveArticleDraft = (
  params: TBody<IArticleDraft>
): Promise<Response | IData<IArticle>> => {
  let config = createConfig(params, {method: "POST", baseURL: API_BASE_URL});
  return refreshFetch(config.baseURL + SAVE_DRAFT, config).then(
    handleReqMiddleware
  );
};

export const saveArticle = (
  params: TBody<IArticle>
): Promise<Response | IData<{articleId: string}>> => {
  let config = createConfig(params, {method: "POST", baseURL: API_BASE_URL});
  return refreshFetch(config.baseURL + SAVE_ARTICLE, config).then(
    handleReqMiddleware
  );
};

export const getDraftHistoryList = (
  params: TBody<IArticleId>
): Promise<Response | IData<IArticleDraft[]>> => {
  let config = createConfig(params, {method: "POST", baseURL: API_BASE_URL});
  return refreshFetch(config.baseURL + ARTICLE_DARFT_HISTORY, config).then(
    handleReqMiddleware
  );
};

export const getDraftHistoryInfo = (
  params: TBody<{id: number}>
): Promise<Response | IData<IArticleDraft>> => {
  let config = createConfig(params, {method: "POST", baseURL: API_BASE_URL});
  return refreshFetch(config.baseURL + ARTICLE_DARFT_INFO, config).then(
    handleReqMiddleware
  );
};