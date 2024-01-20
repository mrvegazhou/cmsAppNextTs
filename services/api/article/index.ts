import type { TBody, TParams } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import type { IData, IArticleId, IArticleUploadImages, IArticleCollabView } from '@/interfaces';
import { 
    CURRENT_ARTICLE_INFO,
    ARTICLE_LIKE,
    ARTICLE_UNLIKE,
    ARTICLE_TOOLBAR_DATA,
    ARTICLE_UPLOAD_IMAGE,
    COLLAB_VIEW,
    EXIT_COLLAB,
    INVITE_COLLAB
} from '@/lib/constant'

export const getCurrentArticleInfo = (
  params: TBody<IArticleId>
): Promise<Response | IData<any>> => {
  let config = createConfig(params, {method: 'POST'});
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
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
  }});
  const url = config.baseURL + ARTICLE_LIKE;
  return fetch(url, config).then(
    handleReqMiddleware
  );
};

export const doArticleUnlike = (
  params: TBody<IArticleId>
): Promise<Response | IData<any>> => {
  let config = createConfig(params, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
  }});
  const url = config.baseURL + ARTICLE_UNLIKE;
  return fetch(url, config).then(
    handleReqMiddleware
  );
};

export const getArticleToolBarData = (
  params: TBody<IArticleId>
): Promise<Response | IData<any>> => {
  let config = createConfig(params, { method: 'POST' });
  const url = config.baseURL + ARTICLE_TOOLBAR_DATA;
  return fetch(url, config).then(
    handleReqMiddleware
  );
};

export const uploadArticleImages = (
  params: TBody<IArticleUploadImages>
): Promise<Response | IData<any>> => {
  const { formData, type } = params.data as any;
  formData.append('type', type);
  const config = createConfig(params, {
    method: 'POST',
    body: formData,
  });
  const url = config.baseURL + ARTICLE_UPLOAD_IMAGE;
  return fetch(url, config).then(
    handleReqMiddleware
  );
};

export const collabViewList = (
  params?: TParams
): Promise<Response | IData<IArticleCollabView>> => {
  let config = createConfig(params, {method: "POST"});
  return fetch(config.baseURL + COLLAB_VIEW, config).then(
    handleReqMiddleware
  );
};

export const exitCollab = (
  params: TBody<IArticleId>
): Promise<Response | IData<boolean>> => {
  let config = createConfig(params, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
  }});
  const url = config.baseURL + EXIT_COLLAB;
  return fetch(url, config).then(
    handleReqMiddleware
  );
};

export const inviteCollab =  (
  params?: TBody<{userIds: number[]; article: number; expireName: string}>
): Promise<Response | IData<string>> => {
  let config = createConfig(params, {method: "POST"});
  return fetch(config.baseURL + INVITE_COLLAB, config).then(
    handleReqMiddleware
  );
};
