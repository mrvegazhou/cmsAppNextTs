import type { TBody } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import type { IData } from '@/interfaces';

import { 
  API_URL,
  PAGE_INFO
} from '@/lib/constant'

// 调试时方便统一修改地址
const API_BASE_URL = API_URL;

export const getPageInfo = (
    params: TBody<{
        type: string
    }>
  ): Promise<Response | IData<any>> => {
    let config = createConfig(params, { method: "POST", baseURL: API_BASE_URL });
    const url = config.baseURL + PAGE_INFO;
    return fetch(url, config).then(
      handleReqMiddleware
    );
};