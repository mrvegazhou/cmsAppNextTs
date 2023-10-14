import type {
    IData,
    ISiteConfig,
} from '@/interfaces';
import type { TBody } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import { SITE_CONFIG_URL } from '@/lib/constant';

export const getSiteConfig = (
    params?: TBody<{uid: number|null}>
  ): Promise<Response | IData<ISiteConfig>> => {
    const config = createConfig(params, { method: 'POST' });
    const url = config.baseURL + SITE_CONFIG_URL;
    return fetch(
      url,
      config
    ).then(handleReqMiddleware);

};