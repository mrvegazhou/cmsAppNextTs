import type { TBody } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import type { IData, IRegisterByEmailBody } from '@/interfaces';
import { 
  REGISTER_BY_EMAIL
} from '@/lib/constant'

export const registerByEmail = (
  params: TBody<IRegisterByEmailBody>
): Promise<Response | IData<any>> => {
    let config = createConfig(params, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }});
    const url = config.baseURL + REGISTER_BY_EMAIL;
    return fetch(url, config).then(
      handleReqMiddleware
    );
};