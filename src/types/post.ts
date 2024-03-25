export type TArticleState = 'SHOW' | 'HIDE' | 'LOCK' | 'CLOSE';

export type TPostReviewState = 'APPROVED' | 'DENIED' | 'PENDING' | 'CLOSE';

export type TPostCompositeState =
  | 'APPROVED'
  | 'DENIED'
  | 'PENDING'
  | 'CLOSE'
  | 'SHOW'
  | 'HIDE'
  | 'LOCK';

export type TPostSortState =
  | 'GLOBAL	'
  | 'CURRENT'
  | 'RECOMMEND'
  | 'POPULAR'
  | 'DEFAULT';

export type TPostOtherStates =
  | 'ALLOW'
  | 'BLOCK'
  | 'CLOSE_COMMENT'
  | 'CLOSE_REPLY'
  | 'CLOSE_COMMENT_REPLY'
  | 'LOGIN_SEE'
  | 'DEFAULT';

export type TPostContentType = 'DEFAULT' | 'LINK' | 'NONE';
