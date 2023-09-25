export interface IRegisterByUsernameBody {
  alias?: string;
  username: string;
  password: string;
  cid: string;
  code: string;
}

export interface IRegisterByPhoneBody {
  alias?: string;
  phone: string;
  code: string;
}

export interface IRegisterByEmailBody {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}
