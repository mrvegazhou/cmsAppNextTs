import type { TParams } from '@/types';
import { createConfig, getQueryParams, handleReqMiddleware } from '@/lib/api';
import type { IData, IUser } from '@/interfaces';
import { GET_PASSWORD_PUBLIC_KEY, USER_INFO } from '@/lib/constant';

const setConfig = (params?: TParams): TParams => {
  return createConfig(params, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  });
}

export const getUserInfo = (
    params?: TParams
  ): Promise<Response | IData<IUser>> => {
    let config = setConfig(params);
    return fetch(config.baseURL + USER_INFO, config).then(
      handleReqMiddleware
    );
};

export const getPasswordPublicKey = (
  params?: TParams
): Promise<Response | IData<string>> => {
  let config = setConfig(params);
  return fetch(config.baseURL + GET_PASSWORD_PUBLIC_KEY, config).then(
    handleReqMiddleware
  );
};


