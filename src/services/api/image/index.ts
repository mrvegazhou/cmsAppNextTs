import type { TBody } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import type { IData, IUploadImages, IUploadImageResp } from '@/interfaces';
import { 
    PERSONAL_IMAGE_LIST,
    API_URL,
    UPLOAD_IMAGE,
    DELETE_IMAGE_BY_ID
} from '@/lib/constant'
import { fetch as refreshFetch } from "@/lib/api/refreshFetch";

const API_BASE_URL = API_URL;

export const getPersonalImageList = (
    params: TBody<{page: number}>
): Promise<Response | IData<any>> => {
    let config = createConfig(params, {
        method: 'POST', 
        baseURL: API_BASE_URL,
        headers: {
          'Content-Type': 'application/json'
    }});
    const url = config.baseURL + PERSONAL_IMAGE_LIST;
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

export const uploadImages = (
    params: TBody<IUploadImages>
  ): Promise<Response | IData<IUploadImageResp>> => {
    const { formData, type, resourceId } = params.data as IUploadImages;
    formData.append('type', type);
    formData.append('resourceId', resourceId ?? "0")
    const config = createConfig(params, {
      method: 'POST',
      baseURL: API_BASE_URL,
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    });
    delete config.data;
    const url = config.baseURL + UPLOAD_IMAGE;
    return refreshFetch(url, config).then(
      handleReqMiddleware
    );
};

export const delImageById = (
  params: TBody<{id: number; imgName?: string}>
) => {
  let config = createConfig(params, {
      method: 'POST', 
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
  }});
  const url = config.baseURL + DELETE_IMAGE_BY_ID;
  return refreshFetch(url, config).then(
    handleReqMiddleware
  );
};