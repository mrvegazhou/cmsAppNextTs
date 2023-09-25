import type { IBase } from '@/interfaces';
import type { TCommentReviewState } from '@/types';

export interface IComment extends IBase {
  content: string;
  likeCount: number;
  secret?: string;
  reviewReason?: string;
  reviewState: TCommentReviewState;
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
