
export interface IBase {
  id?: number;
  createdBy?: number;
  updatedBy?: number;
  createTime?: string;
  updateTime?: string;
  deleteTime?: string;
  expirTime?: string;
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

export interface ITag extends IBase {
  id: number;
  name: string;
}

export interface IType extends IBase {
  id: number;
  name: string;
}

export interface ITypeAndPType {
  id: number;
  name: string;
  pid: number;
  pname: string;
}