import type { IUser } from '@/interfaces';
import { TPostType } from '@/types';

export interface IArticleComment {
  id: number;
  userId: number;
  articleId: number;
  content: string;
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

export interface ICommentList {
  comment: IComment;
  replies: IArticleReply[];
}

export interface IArticleCommentListResp {
  commentList: ICommentList[];
  page: number;
  currentTime: number;
  hasNext: boolean;
}

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

export interface ICommentListReq {
  currentTime: number;
  articleId: number;
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
  pid?: number;
}

export interface ICommentReport {
  id: number;
  type: string;
  content: string;
  reason: string;
  imgs: string;
}