import type { TBody, TParams } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import type { IData, ILoginByEmailBody, ISendEmailCode, IChangeNewPwdByEmailCode } from '@/interfaces';
import { 
  LOGIN_BY_EMAIL, 
  SEND_EMAIL_CODE,
  CHANAGE_PWD_BY_EMAIL_CODE,
  GET_PASSWORD_PUBLIC_KEY,
  REFRESH_TOKEN,
  LOGOUT_BY_EAMIL
} from '@/lib/constant'


export const loginByEmail = (
    params: TBody<ILoginByEmailBody>
  ): Promise<Response | IData<any>> => {
    const config = createConfig(params, { method: 'POST' });
    const url = config.baseURL + LOGIN_BY_EMAIL;
    return fetch(url, config).then(
      handleReqMiddleware
    );
};

export const sendEmailCode = (
  params: TBody<ISendEmailCode>
): Promise<Response | IData<any>> => {
  let config = createConfig(params, { method: 'POST' });
  const url = config.baseURL + SEND_EMAIL_CODE;
  return fetch(url, config).then(
    handleReqMiddleware
  );
};

export const changeNewPwdByEmailCode = (
  params: TBody<IChangeNewPwdByEmailCode>
): Promise<Response | IData<any>> => {
  let config = createConfig(params, { method: 'POST' });
  const url = config.baseURL + CHANAGE_PWD_BY_EMAIL_CODE;
  return fetch(url, config).then(
    handleReqMiddleware
  );
}

export const refreshToken = (
  params: TBody<{
    refreshToken: string;
  }>
): Promise<Response | IData<any>> => {
  let config = createConfig(params, { method: 'POST' });
  const url = config.baseURL + REFRESH_TOKEN;
  return fetch(url, config).then(
    handleReqMiddleware
  );
}

export const getPasswordPublicKey = (
  params?: TParams
): Promise<Response | IData<string>> => {
  let config = createConfig(params, { method: 'POST' });
  return fetch(config.baseURL + GET_PASSWORD_PUBLIC_KEY, config).then(
    handleReqMiddleware
  );
};

export const logout = ( params: TParams): Promise<Response | void> => {
  const config = createConfig(params, { method: 'POST' });
  return fetch(config.baseURL + LOGOUT_BY_EAMIL, config).then(handleReqMiddleware);
};
