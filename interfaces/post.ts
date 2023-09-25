import type {
  IBase,
  IComment,
  IPageable,
  IPagination,
  IPostBadge,
  IPostStyle,
  IReply,
  ISection,
  ITag,
  ITagGroup,
  IUserOv,
} from '@/interfaces';
import type {
  TPostCompositeState,
  TPostContentType,
  TPostOtherStates,
  TPostReviewState,
  TPostSortState,
  TPostState,
} from '@/types';

export interface IPost extends IBase {
  name: string;
  cover?: string;
  overview?: string;
  contentType: TPostContentType;
  contentLink?: string;
  contentUpdatedOn: string;
  _contentUpdatedOnText?: string;
  statement?: string;
  customTags: string[];
  images: string[];
  badges: IPostBadge[];
  styles: IPostStyle[];
  details?: IPostDetails;
  section: ISection;
}

export interface IPostDetails extends IBase {
  state: TPostState;
  reviewState: TPostReviewState;
  sortState: TPostSortState;
  otherStates: TPostOtherStates[];
  reviewReason?: string;
  sortReason?: string;
  otherReason?: string;
  viewCount: number;
  commentCount: number;
  replyCount: number;
  likeCount: number;
  followCount: number;
  favoriteCount: number;
  allow?: number[];
  block?: number[];
  secret?: string;
}

export interface IPostReviewHistory extends IBase {
  reason?: string;
  remark?: string;
  sortReason?: string;
  sortRemark?: string;
  previousReviewState?: TPostCompositeState;
  finalReviewState?: TPostCompositeState;
  previousSortState?: TPostSortState;
  finalSortState?: TPostSortState;
  reviewer: IUserOv;
  _isDefault?: boolean;
}

export interface IPostFavourite extends IBase {
  name: string;
  remark?: string;
  postId: number;
}

export interface IPostFollowsMessage extends IBase {
  name: string;
  content: string;
  contentUpdatedOn: string;
  _contentUpdatedOn?: string;
  postId: number;
}

export interface IPostNewInfo {
  sections: ISection[];
}

export interface IPostEditInfo {
  basic: IPost;
  content: string;
  details: IPostDetails;
  section: ISection;
  sections: ISection[];
  tags: ITag[];
}

export interface IQueryPostDetails {
  user: IUserOv;
  basic: IPost;
  tagGroups?: ITagGroup[];
  tags: ITag[];
  content: string;
  details: IPostDetails;
  section: ISection;
  data: IPagination<IPostComment>;
  replyData: IPostCommentReply;
  parentReplyData: IPostCommentParentReply;
  childReplyData: IPostCommentChildReply;
}

export interface IPostClientDetails {
  user: IUserOv;
  basic: IPost;
  content: string;
  details: IPostDetails;
  section: ISection;
  data: IPagination<IPostComment>;
  isLike: boolean;
  isFollow: boolean;
  isFavourite: boolean;
}

export interface IPostComment {
  _postId: number;
  _commentId: number;
  _commentIndex: number;
  user: IUserOv;
  comment: IComment;
  pageable: IPageable;
  content: IPostCommentReply[];
}

export interface IPostCommentReply {
  _commentId: number;
  _commentIndex: number;
  _replyId: number;
  _replyIndex: number;
  user: IUserOv;
  reply: IReply;
  pageable: IPageable;
  content: IPostCommentParentReply[];
}

export interface IPostCommentParentReply {
  _commentId: number;
  _commentIndex: number;
  _replyId: number;
  _replyIndex: number;
  _parentReplyId: number;
  _parentReplyIndex: number;
  user: IUserOv;
  reply: IReply;
  pageable: IPageable;
  content: IPostCommentChildReply[];
}

export interface IPostCommentChildReply {
  _commentId: number;
  _commentIndex: number;
  _replyId: number;
  _replyIndex: number;
  _parentReplyId: number;
  _parentReplyIndex: number;
  _childReplyId: number;
  _childReplyIndex: number;
  _parentReplyUser: IUserOv;
  user: IUserOv;
  reply: IReply;
}

export interface IUpdatePostNewInfoBody {
  sectionId?: number;
  name?: string;
  cover?: string;
  overview?: string;
  content?: string;
  statement?: string;
  customTags?: string[];
  otherStatus?: string;
  secret?: string;
  allow?: number[];
  block?: number[];
}

export interface IUpdatePostEditInfoBody {
  sectionId?: number;
  name?: string;
  cover?: string;
  overview?: string;
  content?: string;
  statement?: string;
  customTags?: string[];
  otherStatus?: string;
  secret?: string;
  allow?: number[];
  block?: number[];
}

export interface IUploadPostCoverBody {
  file?: string | Blob;
  formData?: FormData;
}

export interface IUploadPostContentBody {
  file?: string | Blob;
  signal?: AbortSignal;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
  formData?: FormData;
}

export interface IUploadPostNewFileBody {
  file?: string | Blob;
  signal?: AbortSignal;
  onUploadProgress?: (progressEvent: ProgressEvent) => void;
  formData?: FormData;
}

export interface IUpdatePostStateBody {
  reviewStatus?: TPostReviewState;
  sortStatus?: TPostSortState;
  reviewReason?: string;
  sortReason?: string;
}

export interface IUpdatePostTagByNameBody {
  name: string;
}

export interface IRemovePostTagByNameBody {
  name: string;
}

export interface IPostStatistics {
  count: number;
}

export interface IUploadMessageSendFile {
  urls: {
    default: string;
  };
}

export interface IUploadPostTemplateFile {
  urls: {
    default: string;
  };
}

export interface IUploadPostCover {
  urls: {
    default: string;
  };
}

export interface IUploadPostContent {
  urls: {
    default: string;
  };
}

export interface IUploadPostNewFile {
  urls: {
    default: string;
  };
}
