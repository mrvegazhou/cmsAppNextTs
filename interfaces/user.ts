import type {
  IBase,
  IPagination,
  IPost,
  ISection,
  ITag,
} from '@/interfaces';


export interface IUser extends IBase {
  username: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  about?: string;
}

export interface IUserClientDetails {
  sections: ISection[];
  tags: ITag[];
  data: IPagination<IPost>;
}

export interface ICreateUserByUsernameBody {
  alias?: string;
  username: string;
  password: string;
}

export interface ICreateUserByPhoneBody {
  alias?: string;
  phone: string;
}

export interface ICreateUserByEmailBody {
  alias?: string;
  email: string;
}

export interface IUpdateUserBasicInfoBody {
  alias?: string;
  username?: string;
  password?: string;
  email?: string;
}

export interface IUpdateUserStatusInfoBody {
  accountNonExpired?: boolean;
  credentialsNonExpired?: boolean;
  accountNonLocked?: boolean;
  enabled?: boolean;
}

export interface IUpdateUserPersonalityInfoBody {
  personalizedSignature?: string;
  smallAvatarUrl?: string;
  mediumAvatarUrl?: string;
  largeAvatarUrl?: string;
  contacts?: {
    key: string;
    val: string;
  }[];
  about?: string;
}

export interface IUpdateUserPasswordBody {
  password?: string;
}

export interface IUserStatistic {
  count: number;
  newUser: number;
}

export interface ICreateContactBody {
  key: string;
  val: string;
}

export interface IRemoveContactBody {
  contactId: string;
}
