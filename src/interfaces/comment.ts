import type { IUser } from '@/interfaces';
import { TPostType } from '@/types';

export interface IArticleComment {
  id: number;
  userId: number;
  articleId: number;
  content: string;
  contentComp: React.ReactNode;
  replyCount: number;
  likeCount: number;
  dislikeCount: number;
  ip: string;
  createTime: string;
  updateTime: string;
}

export interface IArticleReply extends IArticleComment {
  commentId: number;
  replyId?: number;
  fromUser: IUser;
  toUser: IUser;
  toReplyContent?: string;
}

export interface IComment extends IArticleComment {
  userInfo: IUser;
}

// 回复列表
export interface ICommentList {
  comment: IComment;
  replies: IArticleReply[];
  currentTime?: number;
  hasNext?: boolean;
}

export interface IArticleCommentListResp {
  commentList: ICommentList[];
  page: number;
  currentTime: number;
  hasNext: boolean;
}

// 保存评论 
export interface ICommentReq {
  userId: number;
  articleId: number;
  content: string;
  currentTime: number;
}

export interface IReplyReq {
  userId: number;
  articleId: number;
  replyId?: number;
  commentId: number;
  content: string;
  currentTime: number;
}

// 获取评论列表
export interface ICommentListReq {
  currentTime: number;
  articleId: number;
  page: number;
  orderBy: string;
}

// 请求获取评论的回复列表
export interface ICommentRepliesReq {
  currentTime: number;
  commentId: number;
  page: number;
  orderBy: string;
}

export interface EmojiGroup {
  name_zh: string;
  name_en: string;
  emojis: Emoji[];
}
export interface Emoji {
  emoji: string
  name_zh: string;
  name_en: string
}

export interface IPostTypeVal {
  type: TPostType;
  commentId?: number;
  replyId?: number;
}

export interface ICommentReport {
  id: number;
  type: string;
  content: string;
  reason: string;
  imgs: string;
}