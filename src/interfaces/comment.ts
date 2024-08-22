import type { IBase } from '@/interfaces';
import type { TCommentReviewState } from '@/types';

export interface IArticleComment extends IBase {
  userId: number;
  articleId: number;
  content: string;
  likeCount: number;
  unlikeCount?: number;
  ipAddr: string;
}

export interface ICreateCommentBody {
  postId: number;
  content: string;
}

export interface IUpdateCommentReviewStatusBody {
  reviewReason?: string;
  reviewState: TCommentReviewState;
}

export interface ICommentStatistics {
  count: number;
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
