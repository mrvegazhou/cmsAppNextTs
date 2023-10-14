import type { TBody } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import type {
    IData
  } from '@/interfaces';
import { GEN_CAPTCHA_URL, CAPTCHAT_GET, CAPTCHAT_CHECK } from '@/lib/constant';


export const picture4Captcha = (
    params: TBody<{
        captchaType: string;
        clientUid: string | null;
        ts: number;
    }>
): Promise<Response | IData<any>> => {
    let config = createConfig(params, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
      }});
    return fetch(config.baseURL + CAPTCHAT_GET, config).then(
        handleReqMiddleware
    );
};

export const check4Captcha = (
    params: TBody<{
        captchaType: string;
        pointJson: string;
        token: string | undefined;
        ts: number;
    }>
): Promise<Response | IData<any>> => {
    let config = createConfig(params, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
      }});
    return fetch(config.baseURL + CAPTCHAT_CHECK, config).then(
        handleReqMiddleware
      );
};