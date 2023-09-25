import type { IUser } from '@/interfaces/user';

export interface ISiteInfo {
  id: number;
  version: string;
  email: string;
  phone: string;
  qq: string;
  wechat: string;
  weibo: string;
}

export interface ISiteConfig {
  siteConfig: ISiteInfo;
  userInfo?: IUser;
}
