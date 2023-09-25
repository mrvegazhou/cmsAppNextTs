import type {
    IData,
    ISiteConfig,
} from '@/interfaces';
import type { TParams } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import { SITE_CONFIG_URL } from '@/lib/constant';

export const querySiteConfig = (
    params?: TParams
  ): Promise<Response | IData<any>> => {
    const config = createConfig(params, {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }});
    const url = config.baseURL + `${SITE_CONFIG_URL}`;
    return fetch(
      url,
      config
    ).then(handleReqMiddleware);

};