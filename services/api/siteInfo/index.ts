import type { TBody } from '@/types';
import { setConfig, handleReqMiddleware } from '@/lib/api';
import type { IData } from '@/interfaces';

import { 
    PAGE_INFO
} from '@/lib/constant'


export const getPageInfo = (
    params: TBody<{
        type: string
    }>
  ): Promise<Response | IData<any>> => {
    let config = setConfig(params);
    const url = config.baseURL + PAGE_INFO;
    return fetch(url, config).then(
      handleReqMiddleware
    );
};