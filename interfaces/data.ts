
export interface IBase {
  id: number;
  createdBy?: number;
  updatedBy?: number;
  createTime?: string;
  updateTime?: string;
  deleteTime?: string;
  expirTime?: string;
}

export interface IPagination<item> {
  content: item[];
  pageable: IPageable;
}

export interface IPageable {
  next: boolean;
  page: number;
  pages: number;
  previous: boolean;
  size: number;
  keyset?: IKeySet;
}

export interface IKeySet {
  lowest: [];
  highest: [];
}

export interface IQueryParams {
  page?: number;
  size?: number;
  sort?: string;
  tagId?: number;
  tid?: number;
  sectionId?: number;
  sid?: number;
  postId?: number;
  pid?: number;
  userId?: number;
  uid?: number;
}

export interface IToken {
  id: number;
  alias: string;
  token: string;
  refreshToken: string;
}

export interface IData<T> {
  status: number;
  message: string;
  data: T;
}

export interface ILocale {
  locale: string;
}