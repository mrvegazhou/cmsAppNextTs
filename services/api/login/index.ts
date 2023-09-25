import type { TBody } from '@/types';
import { setConfig, handleReqMiddleware } from '@/lib/api';
import type { IData, ILoginByEmailBody, ISendEmailCode, IChangeNewPwdByEmailCode } from '@/interfaces';
import { 
  LOGIN_BY_EMAIL, 
  SEND_EMAIL_CODE,
  CHANAGE_PWD_BY_EMAIL_CODE
} from '@/lib/constant'


export const loginByEmail = (
    params: TBody<ILoginByEmailBody>
  ): Promise<Response | IData<any>> => {
    let config = setConfig(params);
    const url = config.baseURL + LOGIN_BY_EMAIL;
    return fetch(url, config).then(
      handleReqMiddleware
    );
  };

export const sendEmailCode = (
  params: TBody<ISendEmailCode>
): Promise<Response | IData<any>> => {
  let config = setConfig(params);
  const url = config.baseURL + SEND_EMAIL_CODE;
  return fetch(url, config).then(
    handleReqMiddleware
  );
};

export const changeNewPwdByEmailCode = (
  params: TBody<IChangeNewPwdByEmailCode>
): Promise<Response | IData<any>> => {
  let config = setConfig(params);
  const url = config.baseURL + CHANAGE_PWD_BY_EMAIL_CODE;
  return fetch(url, config).then(
    handleReqMiddleware
  );
}

export const refreshToken = (
  params: TBody<{
    retoken: string;
  }>
): Promise<Response | IData<any>> => {
  let config = setConfig(params);
  const url = config.baseURL + CHANAGE_PWD_BY_EMAIL_CODE;
  return fetch(url, config).then(
    handleReqMiddleware
  );
}