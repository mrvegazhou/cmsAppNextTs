export type TConfigType =
  | 'user'
  | 'site'
  | 'jwt'
  | 'section'
  | 'post'
  | 'qq'
  | 'image'
  | 'phone'
  | 'email'
  | 'client';

export type IConfigEmailContentType = 'LOGIN' | 'REGISTER' | 'VERIFY';

export type IConfigPhoneContentType = 'LOGIN' | 'REGISTER' | 'VERIFY';

export type IConfigImageContentType = 'LOGIN' | 'REGISTER' | 'VERIFY';
