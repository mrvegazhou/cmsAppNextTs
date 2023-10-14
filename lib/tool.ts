import { StaticImageData } from 'next/image';
import * as jose from 'jose';
import CryptoJS from 'crypto-js';
import LZString from 'lz-string';
import dayjs from 'dayjs';
import type { Metadata } from 'next';
import type { IData, IError, IUser } from '@/interfaces';
import type { TMetadata } from '@/types';

export const aesEncryptStr = (str: string, key: string) => {
    return CryptoJS.AES.encrypt(str, key).toString();
};
  
export const aesDecryptStr = (str: string, key: string) => {
    const bytes = CryptoJS.AES.decrypt(str, key);
    return bytes.toString(CryptoJS.enc.Utf8);
};

export const decodeJwtExpToSeconds = (jwt: string): number | undefined => {
    return jwtExpToSeconds(jose.decodeJwt(jwt).exp);
};

export const jwtExpToSeconds = (
    exp: number | undefined,
): number | undefined => {
    if (!exp) {
        return;
    }
    return dayjs(exp).diff(dayjs(), 'seconds');
};

export const isNull = (value: string | undefined | null) => {
    return value === null || value === undefined || value === '';
};

export const isEmail = (val: string) => {
  var reg = /^[0-9a-zA-Z_.-]+[@][0-9a-zA-Z_.-]+([.][a-zA-Z]+){1,2}$/;
  if (reg.test(val)) {
    return true;
  } else {
    return false;
  }
};

export const isPasswordLen = (pwd: string) => {
  var len = pwd.length;
  if (len < 6 || len > 20) {
    return false;
  }
  return true;
};

export const isPassword = (pwd: string) => {
  var reg1 = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\~\!\@\#\$\%\^\&\*\(\)\_\+])[A-Za-z\d\~\!\@\#\$\%\^\&\*\(\)\_\+]{6,20}$/
  var reg2 = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,20}$/
  var reg3 = /^(?=.*[a-z])(?=.*\d)(?=.*[\~\!\@\#\$\%\^\&\*\(\)\_\+])[a-z\d\~\!\@\#\$\%\^\&\*\(\)\_\+]{6,20}$/
  var reg4 = /^(?=.*[a-z])(?=.*\d)[a-z\d]{6,20}$/
  if (reg1.test(pwd)) {
    //高级密码
    return 3;
  } else if (reg2.test(pwd) || reg3.test(pwd)) {
    //中级密码
    return 2;
  } else if (reg4.test(pwd)) {
    //低级密码
    return 1;
  }
  return 0;
};

export const nonNull = (value: string | undefined | null) => {
    return !isNull(value);
};


export const getMetadata = (
    options: Metadata & { index?: boolean } = {
      title: 'App',
      index: true,
    },
  ): Metadata => {
    const _metadata: Metadata = {
      ...options,
      title: `${options.title} - ${process.env.APP_URL_HOST}`,
      applicationName: process.env.APP_NAME,
      generator: process.env.APP_NAME,
    };
  
    if (!_metadata.robots) {
      if (options.index === undefined || options.index) {
        _metadata.robots = {
          index: true,
          follow: true,
        };
      } else {
        _metadata.robots = {
          index: false,
          follow: false,
        };
      }
    }
  
    return _metadata;
};

export const customException = (status = 500, message = '未知错误'): IError => {
    return {
      status,
      message,
    };
};


export const parseMessage = (message: any): string => {
  if (message === undefined || message === null) {
    return '';
  }

  if (typeof message === 'object' && 'message' in message) {
    return parseMessage(message.message);
  }

  if (message instanceof Error) {
    return parseMessage(message.message);
  }

  return String(message);
};

export const isPhone = (phone: string) => {
  return /^1[3-9]\d{9}$/.test(phone);
};

export const isHttpOrHttps = (value: string) => {
  return value.startsWith('http') || value.startsWith('https');
};

export const getUserAvatar = (
  user: IUser | null | undefined,
  metadata: TMetadata,
): {
  smallAvatarUrl: string | StaticImageData;
  mediumAvatarUrl: string | StaticImageData;
  largeAvatarUrl: string | StaticImageData;
} => {
  const env = metadata.env;
  const urls: {
    smallAvatarUrl: string | StaticImageData;
    mediumAvatarUrl: string | StaticImageData;
    largeAvatarUrl: string | StaticImageData;
  } = {
    smallAvatarUrl: "",
    mediumAvatarUrl: "",
    largeAvatarUrl: "",
  };

  if (!user) {
    return urls;
  }
  // @ts-ignore
  const smallAvatarUrl = user.details!.smallAvatarUrl;
  // @ts-ignore
  const mediumAvatarUrl = user.details!.mediumAvatarUrl;
  // @ts-ignore
  const largeAvatarUrl = user.details!.largeAvatarUrl;

  if (smallAvatarUrl) {
    urls.smallAvatarUrl = isHttpOrHttps(smallAvatarUrl)
      ? smallAvatarUrl
      : env.APP_OSS_SERVER + smallAvatarUrl;
  }

  if (mediumAvatarUrl) {
    urls.mediumAvatarUrl = isHttpOrHttps(mediumAvatarUrl)
      ? mediumAvatarUrl
      : env.APP_OSS_SERVER + mediumAvatarUrl;
  }

  if (largeAvatarUrl) {
    urls.largeAvatarUrl = isHttpOrHttps(largeAvatarUrl)
      ? largeAvatarUrl
      : env.APP_OSS_SERVER + largeAvatarUrl;
  }
  return urls;
};

export function isFunction(val: unknown): val is Function {
  return typeof val === 'function';
}

import type JSEncrypt from 'jsencrypt';
import { MutableRefObject } from 'react';

export async function getJsEncrypt(jsEncryptRef: MutableRefObject<any | undefined>): Promise<JSEncrypt> {
  let jsEncrypt;
  if (jsEncryptRef.current) {
    jsEncrypt = jsEncryptRef.current;
  } else {
    const JSEncrypt = (await import('jsencrypt')).JSEncrypt;
    jsEncrypt = new JSEncrypt();
    jsEncryptRef.current = jsEncrypt;
  }
  return jsEncrypt;
}

export const toRelativeTime = (time: string) => {
  return dayjs().utc().local().to(dayjs(time).utc());
};