export interface IGenerateCaptchaByEmailBody {
  email: string;
}

export interface IGenerateCaptchaByEmail {
  id: string;
}

export interface IGenerateImageId {
  id: string;
}

export interface ISendEmailCode {
  email: string;
  codeType: number;
}

export interface IChangePwdByEmailCode {
  code: string;
  email: string;
  newPassword: string;
  confirmNewPassword: string;
}