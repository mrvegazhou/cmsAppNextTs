import type {
  IBase
} from '@/interfaces';


export interface IUser extends IBase {
  nickname: string;
  phone?: string;
  email: string;
  avatarUrl?: string;
  about?: string;
  id?: number;
}

export interface IUserList {
  userList: IUser[];
  page?: number;
  totalPage?: number;
  hasNextPage?: boolean;
}

export interface IUserByNameReq {
  name: string;
  page?: number;
}


