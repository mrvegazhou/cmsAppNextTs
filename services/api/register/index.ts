import type { TBody } from '@/types';
import { setConfig, handleReqMiddleware } from '@/lib/api';
import type { IData, IRegisterByEmailBody } from '@/interfaces';
import { 
  REGISTER_BY_EMAIL
} from '@/lib/constant'

export const registerByEmail = (
  params: TBody<IRegisterByEmailBody>
): Promise<Response | IData<any>> => {
    let config = setConfig(params);
    const url = config.baseURL + REGISTER_BY_EMAIL;
    return fetch(url, config).then(
      handleReqMiddleware
    );
};