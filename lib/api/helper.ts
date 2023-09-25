import dayjs from 'dayjs';
import { nonNull } from '@/lib/tool';
import { type CookieSerializeOptions, serialize } from 'cookie';
import type { TBody, TParams } from '@/types';
import { BASE_URL } from '@/lib/constant/index';

import {
    type NextFetchEvent,
    type NextMiddleware,
    type NextRequest,
    NextResponse,
} from 'next/server';
import { IData } from '@/interfaces';

export const getQueryParams = (
    config: TParams | TBody<any>,
    params?: {},
    addQuestionMark: boolean = false,
  ) => {
    const _params = {
      ...((config as TParams).query || (config as TBody<any>).data),
      ...params,
    };
  
    const newParams: Record<string, any> = {};
    for (let paramsKey in _params) {
      if (nonNull(_params[paramsKey])) {
        if (typeof _params[paramsKey] === 'number') {
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
    options: CookieSerializeOptions = {},
) => {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
  
    if (typeof options.maxAge !== 'undefined' && !options.expires) {
      options.expires = dayjs().set('seconds', options.maxAge).toDate();
    }
  
    return serialize(name, stringValue, options);
};


export const createConfig = (
  target: TParams | TBody<any> = {},
  source?: TParams | TBody<any>,
): TParams => {
  const token = source?.token ?? target?.token;
  const config = {
    ...source,
    ...target,
  };

  if (!config.baseURL) {
    config.baseURL = BASE_URL+'/api';
  }

  if (
    config.method === 'POST' ||
    config.method === 'PUT' ||
    config.method === 'PATCH'
  ) {
    if (!config.body) {
      if (!config.headers) {
        config.headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };
      }

      const reqData = (config as TBody<any>).data;
      if (reqData) {
        config.body = JSON.stringify(reqData);
      }
    }
  }
  config.mode = 'cors';
  return token
    ? {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        },
      }
    : config;
};

export const handleReqMiddleware = (
  response: Response,
  skipParse?: boolean,
) => {
  return handleReqError(response).then((value) =>
    handleReqData(value, skipParse),
  );
};

export const handleReqError = async (response: Response) => {
  const headersLength = Object.keys(response.headers).length;
  if (
    !response.ok &&
    (response.headers.get('content-type') === 'application/json' ||
      headersLength === 0)
  ) {
    const reason = {
      status: 500,
      message: '未知错误',
      ...(await response.json()),
    };
    if (headersLength === 0) {
      throw reason;
    }
    throw {
      ...reason,
      headers: response.headers,
    };
  }
  return response;
};

export const handleReqData = async (
  response: Response,
  skipParse?: boolean,
) => {
  if (skipParse) {
    return response;
  }
  if (
    // isClient() &&
    response.headers.get('content-type')?.includes('application/json')
  ) {
    return await response.json();
  }
  return response;
};

export const setConfig = (params?: TParams): TParams => {
  return createConfig(params, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });
}

export const isClient = () => {
  return typeof window !== 'undefined';
};
