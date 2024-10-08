import { StaticImageData } from 'next/image';
import { jwtDecode } from "jwt-decode";
import CryptoJS from 'crypto-js';
import dayjs from 'dayjs';
import type { Metadata } from 'next';
import type { IError, IUser } from '@/interfaces';
import type { HexObject, TBody, TMetadata } from '@/types';
import punycode from 'punycode';
import qs from 'query-string'
import { type CookieSerializeOptions, serialize } from "cookie";


export const aesEncryptStr = (str: string, key: string, IV: string = '0123456789abcdef') => {
    str = (str + '').replace(/\n*$/g, '').replace(/\n/g, '');
    return CryptoJS.AES.encrypt(str, CryptoJS.enc.Utf8.parse(key), {
        iv: CryptoJS.enc.Utf8.parse(IV),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString();
};
  
export const aesDecryptStr = (str: string, key: string, IV: string = '0123456789abcdef') => {
    str = (str + '').replace(/\n*$/g, '').replace(/\n/g, '');
    let newKey = CryptoJS.enc.Utf8.parse(key);
    const decrypt = CryptoJS.AES.decrypt(str, newKey, {
      iv: CryptoJS.enc.Utf8.parse(IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypt.toString(CryptoJS.enc.Utf8);
};

export const decodeJwtExpToSeconds = (jwt: string): number | undefined => {  
    return jwtExpToSeconds(jwtDecode(jwt).exp);
};

export const jwtExpToSeconds = (
    exp: number | undefined,
): number | undefined => {
    if (!exp) {
        return;
    }
    return dayjs(Date.now()).diff(exp, 'seconds');
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

// 验证密码正确和强弱
export const isPassword = (pwd: string, len: number = 6) => {
  let isValid = false;
  // 检查密码长度
  const lengthRequirement = pwd.length >= len; 
  if (!lengthRequirement) {  
    return {  
      isValid: isValid,  
      strength: PWD_STRENGTH.WEAK,   
    };  
  }
  // 检查是否包含大写字母、数字和特殊字符  
  const hasUpperCase = /[A-Z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
  let strength = PWD_STRENGTH.WEAK;
  if (hasUpperCase && hasNumber) {  
    strength = PWD_STRENGTH.MEDIUM;
    if (hasSpecialChar) {  
      strength = PWD_STRENGTH.STRONG;  
    }
  } else if (hasSpecialChar && (hasUpperCase || hasNumber)) {
    strength = PWD_STRENGTH.MEDIUM;  
  }
  const hasLowerCase = /[a-z]/.test(pwd);
  return {
    isValid: lengthRequirement && (hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar),
    strength 
  };
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
import { PWD_STRENGTH } from './constant';

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

function isValidKey(
  key: string | number | symbol,
  object: object
): key is keyof typeof object {
  return key in object;
}

export function forEach(obj: Object, callback: Function) {
  if (obj) {
    for (const key in obj) { // eslint-disable-line no-restricted-syntax
      if ({}.hasOwnProperty.call(obj, key)) {
        if(isValidKey(key, obj)) {
          callback(key, obj[key]);
        }
      }
    }
  }
}

export function isMap(obj: any) {
  return Object.prototype.toString.call(obj) === '[object Object]';
}

export const mergeRecursive = (obj1: any, obj2: any) => {
  if (obj1 && obj2 === undefined) {
    return obj1;
  }
  const mergedValue: Record<string | number, any> = {};
  forEach(obj1, (key:string | number, value:any) => {
    if (isMap(value)) {
      mergedValue[key] = mergeRecursive(value, obj2[key]);
    } else {
      mergedValue[key] = obj2[key] !== undefined ? obj2[key] : value;
    }
  });
  return mergedValue;
};

export const isURL = (URL: string) => {
  var str=URL;
  //判断URL地址的正则表达式为:http(s)?://([\w-]+\.)+[\w-]+(/[\w- ./?%&=]*)?
  //下面的代码中应用了转义字符"\"输出一个字符"/"
  var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
  var objExp = new RegExp(Expression);
  if(objExp.test(str)==true) {
       return true;
  } else {
       return false;
  }
};

export const loadImage = (src: string, getBase64?: boolean, scale?: boolean): Promise<[HTMLImageElement, string?]> => {
  return new Promise(function(resolve, reject){
      var img = new Image();
      img.src = src;
      if (getBase64) {
        let canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        img.onload = function(){
          canvas.height = img.height;
          canvas.width = img.width;
          ctx!.drawImage(img, 0, 0, img.width, img.height);
          const dataURL = canvas.toDataURL("image/jpeg", 1); 
          resolve([img, dataURL])
        }
      } else {
        /* 加载完成时执行一下代码 */
        img.onload = function(){
          /* 执行resolve回调函数，传入参数img对象 */
          resolve([img])
        }
      }  
  })
}
// 缩放图片
const scaleImg = (img: HTMLImageElement) => {
  let t = 200;
  let scale = 1;
  let width = img.width;
  let height = img.height;
  if (width > t || height > t) {
    if (width > height) {
      scale = t / width;
    }else {
      scale = t / height;
    }
  }
  return [width * scale, height * scale];
};

function readBuffer(file: File, start = 0, end = 2) { 
  return new Promise((resolve, reject) => { 
    const reader = new FileReader(); 
    reader.onload = () => { 
      resolve(reader.result); 
    }; 
    reader.onerror = reject; 
    reader.readAsArrayBuffer(file.slice(start, end)); 
  }); 
} 
// 判断是否为图片
export const isImageType = async (file: File) => {
  if (!file.type.startsWith('image/')) return false;
  let flag = false;
  const magicNumbers: HexObject = {
    'jpeg': [0xFF, 0xD8, 0xFF],
    'png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    'gif': [0x47, 0x49, 0x46, 0x38],
    'bmp': [0x42, 0x4D],
    'webp': [0x52, 0x49, 0x46, 0x46]
  };
  for (const key in magicNumbers) {
    const buffers: any = await readBuffer(file, 0, magicNumbers[key].length);
    let uint8Array = new Uint8Array(buffers);
    if (magicNumbers[key].every((el, index) => el === uint8Array[index])) {
      flag = true;
      break;
    } else {
      flag = false;
    }
  }
  return flag;
};

// 
export const isFormDataEmpty = (formData: FormData) => {
  for (const entry of formData.entries()) {
    if (entry[0] || entry[1]) {
      return false;
    }
  }
  return true;
}

export const handleDrop = (event: React.SyntheticEvent<Element> | React.DragEvent<HTMLDivElement> | React.ChangeEvent<Element> | React.KeyboardEvent<Element> | React.MouseEvent<Element>) => {
  event.preventDefault();
  event.stopPropagation();
}

const pow1024 = (num: number) => Math.pow(1024, num);
export const convertBytesToKB = (bytes: number) => Math.round(bytes / pow1024(1) * 100) / 100;

// 统计字数
export const WordCounter = (plainText: string) => {
  const regex = /(?:\r\n|\r|\n)/g; // new line, carriage return, line feed
  const cleanString = plainText.replace(regex, ' ').trim(); 
  const wordArray = cleanString.match(/\S+/g);
  return wordArray ? wordArray.length : 0;
};

export const CharCounter = (plainText: string) => {
  const decodeUnicode = (str: string): number[] => punycode.ucs2.decode(str); // func to handle unicode characters
  const regex = /(?:\r\n|\r|\n)/g; // new line, carriage return, line feed
  const cleanString = plainText.replace(regex, '').trim(); // replace above characters w/ nothing
  return decodeUnicode(cleanString).length;
};

// 统计行数
export const LineCounter = (plainText: string, hasSpace: boolean) => {
  let arr = plainText.split(/[(\r\n)\r\n]+/);
  if ( !hasSpace ) {
    arr.forEach((item,index)=>{
      if ( !item ) {
        arr.splice(index, 1);//删除空项
      }
    })
  }
  return arr.length;
};

// fetch 下载图片
export const GetImageFile = async (imageUrl: string, fileName: string) => {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const file = new File([blob], fileName);
  return file;
}

// 获取当前地址
export const GetCurrentUrl = (hasSearchParams: boolean = false) => {
  const urlParams = new URL(window.location.href);
  const pathname = urlParams?.pathname;
  let url = document.location.toString();
  let arrUrl = url.split("//");
  let host = window.location.host;
  if (!hasSearchParams) {
    return `${arrUrl[0]}//${host}${pathname}`;
  } else {
    const search = window.location.search;
    return `${arrUrl[0]}//${host}${pathname}//${search}`;
  }
};

export const GetCurrentPath = () => {
  const urlParams = new URL(window.location.href);
  const pathname = urlParams?.pathname;
  const idx = pathname.indexOf('/', pathname.indexOf('/') + 1);
  const pathStr = pathname.substring(0, idx);
  let url = document.location.toString();
  let arrUrl = url.split("//");
  let host = window.location.host;
  return `${arrUrl[0]}//${host}${pathStr}`;
};

interface Dictionary<T> {
  [key: string]: T;
}
export function FilterDictionaryByKey<T>(dict: Dictionary<T>, keys: string[]): Dictionary<T> {
  return Object.keys(dict).reduce((acc, key) => {
    if (!keys.includes(key)) {
      acc[key] = dict[key];
    }
    return acc;
  }, {} as Dictionary<T>);
}

export function getUserAgent() {
  var ua = navigator.userAgent,
  isWindowsPhone = /(?:Windows Phone)/.test(ua),
  isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone,
  isAndroid = /(?:Android)/.test(ua),
  isFireFox = /(?:Firefox)/.test(ua),
  isTablet = /(?:iPad|PlayBook)/.test(ua) || (isAndroid && !/(?:Mobile)/.test(ua)) || (isFireFox && /(?:Tablet)/.test(ua)),
  isPhone = /(?:iPhone)/.test(ua) && !isTablet,
  isPc = !isPhone && !isAndroid && !isSymbian;
  return {
      isTablet: isTablet,
      isPhone: isPhone,
      isAndroid: isAndroid,
      isPc: isPc
  };
}

export const buildURL = (url: string, params: Record<string, any>) => {
  if (!params) {
    return url;
  }
  const p = qs.stringify(params);
  // params序列化过程略
  let hashmarkIndex = url.indexOf('#');
  let hashmark = "";
  if (hashmarkIndex !== -1) {
    hashmark = url.slice(hashmarkIndex);
    url = url.slice(0, hashmarkIndex);
  }
  url += (url.indexOf('?') === -1 ? '?' : '&') + p + hashmark;
  console.log(url, "==url===");
  return url;
};

export const replaceURL = (url: string, params: Record<string, any>) => {
  const urlObj = new URL(url);
  for (let prop in params) {
    urlObj.searchParams.set(prop, params[prop])
  }
  return url.split('?')[0] + urlObj.searchParams.toString();
};

export const checkURLExistParam = (url: string, param: string) => {
  const obj = new URL(url);
  // 检查是否存在某个参数
  if (obj.searchParams.has(param)) {
    return true;
  } else {
    return false;
  }
};

//
export const getQueryParams = (
  config: TBody,
  params?: {},
  addQuestionMark: boolean = false
) => {
  const _params = {
    ...((config as TBody).query || (config as TBody).data),
    ...params,
  };

  const newParams: Record<string, any> = {};
  for (let paramsKey in _params) {
    if (nonNull(_params[paramsKey])) {
      if (typeof _params[paramsKey] === "number") {
        if (!isNaN(_params[paramsKey])) {
          newParams[paramsKey] = _params[paramsKey];
        }
      } else {
        newParams[paramsKey] = _params[paramsKey];
      }
    }
  }

  const value = new URLSearchParams(newParams).toString();
  return value && addQuestionMark ? `?${value}` : value;
};

export const serializeCookie = (
  name: string,
  value: unknown,
  options: CookieSerializeOptions = {}
) => {
  const stringValue =
    typeof value === "object" ? JSON.stringify(value) : String(value);

  if (typeof options.maxAge !== "undefined" && !options.expires) {
    options.expires = dayjs().set("seconds", options.maxAge).toDate();
  }
  return serialize(name, stringValue, options);
};
