import type { IBase } from '@/interfaces';
import type {
  TChildReplyReviewState,
  TParentReplyReviewState,
  TReplyReviewState,
} from '@/types';

export interface IReplyBase extends IBase {
  content: string;
  likeCount: number;
  reviewReason?: string;
  reviewState: TReplyReviewState;
}

export interface IReply extends IReplyBase {
  emptyParentReplyList?: boolean;
}

export interface IParentReply extends IReplyBase {
  emptyChildReplyList?: boolean;
}

export interface IChildReply extends IReplyBase {}

export interface ICreateReplyBody {
  commentId: number;
  content: string;
}

export interface ICreateParentReplyBody {
  replyId: number;
  content: string;
}

export interface ICreateChildReplyBody {
  parentReplyId: number;
  content: string;
}

export interface IReplyStatistics {
  count: number;
}

export interface IParentReplyStatistics {
  count: number;
}

export interface IChildReplyStatistics {
  count: number;
}

export interface IUpdateReplyReviewStatusBody {
  reviewReason?: string;
  reviewStatus: TReplyReviewState;
}

export interface IUpdateParentReplyReviewStatusBody {
  reviewReason?: string;
  reviewStatus: TParentReplyReviewState;
}

export interface IUpdateChildReplyReviewStatusBody {
  reviewReason?: string;
  reviewStatus: TChildReplyReviewState;
}
