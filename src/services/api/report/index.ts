import type { TBody } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import type { 
    IData,
    IReportReasonReq,
    IReportReason
} from '@/interfaces';
import {
    API_URL,
    REPORT_REASON_LIST,
    SEND_REPORT,

} from '@/lib/constant';
import { fetch as refreshFetch } from "@/lib/api/refreshFetch";

const API_BASE_URL = API_URL;

export const getReportReasonList = (): Promise<Response | IData<IReportReason[]>> => {
    let config = createConfig({}, {
      method: 'POST', 
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    const url = config.baseURL + REPORT_REASON_LIST;
    return fetch(url, config).then(
      handleReqMiddleware
    );
};

export const getReportReasonsQueryConf = {
    staleTime: 1000 * 3600 * 12, // 3小时后过期
    retry: 3, // 在显示错误之前将重试失败的请求3次
    retryDelay: 5000, // 总是等待 1000ms 重新请求, 忽略总共请求了多少次
    // keepPreviousData: true
};

export const sendReportReason = (
    params: TBody<IReportReasonReq>
): Promise<Response | IData<boolean>> => {
    let config = createConfig(params, {
      method: 'POST', 
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    const url = config.baseURL + SEND_REPORT;
    return refreshFetch(url, config).then(
      handleReqMiddleware
    );
};