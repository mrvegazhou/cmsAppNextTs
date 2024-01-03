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