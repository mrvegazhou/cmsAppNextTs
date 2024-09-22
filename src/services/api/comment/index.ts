import type { TBody } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import type { 
    IData,
    ICommentReq,
    IReplyReq,
    IArticleComment,
    ICommentListReq,
    IArticleReply,
    IArticleCommentListResp,
    ICommentRepliesReq,
    ICommentList
} from '@/interfaces';
import {
    API_URL,
    SAVE_ARTICLE_COMMENT,
    ARTICLE_COMMENT_LIST,
    ARTICLE_COMMENT_REPLY_LIST,
    SAVE_ARTICLE_REPLY
} from '@/lib/constant';
import { fetch as refreshFetch } from "@/lib/api/refreshFetch";

const API_BASE_URL = API_URL;

export const saveArticleComment = (
    params: TBody<ICommentReq>
): Promise<Response | IData<IArticleComment>> => {
    let config = createConfig(params, {
      method: 'POST', 
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    const url = config.baseURL + SAVE_ARTICLE_COMMENT;
    return refreshFetch(url, config).then(
      handleReqMiddleware
    );
};

export const getArticleCommentList = (
    params: TBody<ICommentListReq>
): Promise<Response | IData<IArticleCommentListResp>> => {
    let config = createConfig(params, {
      method: 'POST', 
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    const url = config.baseURL + ARTICLE_COMMENT_LIST;
    return fetch(url, config).then(
      handleReqMiddleware
    );
};

export const getCommentListQueryConf = {
    staleTime: 1000, // 一分钟后过期
    retry: 3, // 在显示错误之前将重试失败的请求3次
    retryDelay: 5000,
};

export const saveArticleReply = (
    params: TBody<IReplyReq>
): Promise<Response | IData<IArticleReply>> => {
    let config = createConfig(params, {
      method: 'POST', 
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    const url = config.baseURL + SAVE_ARTICLE_REPLY;
    return refreshFetch(url, config).then(
      handleReqMiddleware
    );
};

// 获取评论下的回复列表
export const getCommentReplies = (
  params: TBody<ICommentRepliesReq>
): Promise<Response | IData<ICommentList>> => {
  let config = createConfig(params, {
    method: 'POST', 
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });
  const url = config.baseURL + ARTICLE_COMMENT_REPLY_LIST;
  return fetch(url, config).then(
    handleReqMiddleware
  );
};