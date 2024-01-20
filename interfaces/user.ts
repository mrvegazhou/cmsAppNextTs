import type {
  IBase
} from '@/interfaces';


export interface IUser extends IBase {
  nickname: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  about?: string;
}

export interface IUserList {
  userList: IUser[];
  page?: number;
  totalPage?: number;
}


