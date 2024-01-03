import type { TBody } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import type { IData, IArticleId, IArticleUploadImages } from '@/interfaces';
import { 
    CURRENT_ARTICLE_INFO,
    ARTICLE_LIKE,
    ARTICLE_UNLIKE,
    ARTICLE_TOOLBAR_DATA,
    ARTICLE_UPLOAD_IMAGE
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
  const { formData } = params.data as any;
  const config = createConfig(params, {
    method: 'POST',
    body: formData,
  });
  const url = config.baseURL + ARTICLE_UPLOAD_IMAGE;
  return fetch(url, config).then(
    handleReqMiddleware
  );
};
