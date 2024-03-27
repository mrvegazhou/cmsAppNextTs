import type { TBody } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import type { IData, IType, ITypeAndPType } from '@/interfaces';
import { 
    APP_TYPE_LIST, APP_TYPE_PID, APP_TYPE_ID, API_URL
} from '@/lib/constant'

const API_BASE_URL = API_URL;

export const getTypeList = (
    params: TBody<{ name: string }>
): Promise<Response | IData<{ typeList: IType[] }>> => {
    let config = createConfig(params, { method: 'POST', baseURL: API_BASE_URL });
    const url = config.baseURL + APP_TYPE_LIST;
    return fetch(url, config).then(
        handleReqMiddleware
    );
};

export const getTypeListQueryConf = {
    staleTime: 1000 * 3600 * 3, // 3小时后过期
    retry: 3, // 在显示错误之前将重试失败的请求3次
    retryDelay: 5000, // 总是等待 1000ms 重新请求, 忽略总共请求了多少次
    // keepPreviousData: true
};

export const getTypeListByPid = (
    params: TBody<{ pid: number }>
): Promise<Response | IData<{ typeList: IType[] }>> => {
    let config = createConfig(params, { method: 'POST', baseURL: API_BASE_URL });
    const url = config.baseURL + APP_TYPE_PID;
    return fetch(url, config).then(
        handleReqMiddleware
    );
};

export const getTypeInfoById = (
    params: TBody<{ id: number }>
): Promise<Response | IData<{ typeInfo: ITypeAndPType }>> => {
    let config = createConfig(params, { method: 'POST', baseURL: API_BASE_URL });
    const url = config.baseURL + APP_TYPE_ID;
    return fetch(url, config).then(
        handleReqMiddleware
    );
};