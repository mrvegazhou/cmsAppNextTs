import type { TBody } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import type { IData } from '@/interfaces';
import { 
    ARTICLE_IMAGE_LIST
} from '@/lib/constant'

export const getPersonalImageList = (
    params: TBody<{page: number}>
): Promise<Response | IData<any>> => {
    let config = createConfig(params, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
    }});
    const url = config.baseURL + ARTICLE_IMAGE_LIST;
    return fetch(url, config).then(
        handleReqMiddleware
    );
};

export const getPersonalImageListConf = {
    staleTime: 1000 * 3600 * 5, // 3小时后过期
    retry: 3, // 在显示错误之前将重试失败的请求3次
    retryDelay: 5000, // 总是等待 1000ms 重新请求, 忽略总共请求了多少次
    keepPreviousData: true
};