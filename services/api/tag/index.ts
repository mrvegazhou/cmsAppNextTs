import type { TBody } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import type { IData, ITag } from '@/interfaces';
import { 
    APP_TAG_LIST
} from '@/lib/constant'

export const getTagList = (
    params: TBody<{ name: string }>
): Promise<Response | IData<{ tagList: ITag[] }>> => {
    let config = createConfig(params, { method: 'POST' });
    const url = config.baseURL + APP_TAG_LIST;
    return fetch(url, config).then(
        handleReqMiddleware
    );
};