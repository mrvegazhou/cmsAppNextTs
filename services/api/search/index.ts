import type { TBody, TParams } from '@/types';
import { setConfig, handleReqMiddleware } from '@/lib/api';
import type { IData } from '@/interfaces';
import { 
    SEARCH_TRENDING_TODAY
} from '@/lib/constant'
import { fetch } from "@/lib/api/refreshFetch";


export const searchTrendingToday = (
    params: TBody<{
      val: string;
    }>
): Promise<Response | IData<any>> => {
    let config = setConfig(params);
    const url = config.baseURL + SEARCH_TRENDING_TODAY;
    return fetch(url, config).then(
      handleReqMiddleware
    );
};