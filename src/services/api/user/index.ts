import { createConfig, handleReqMiddleware } from '@/lib/api';
import type { IData, IUser, IUserByNameReq, IUserList } from '@/interfaces';
import { API_URL, USER_INFO, SEARCH_USER_LIST } from '@/lib/constant';
import type { TBody } from '@/types';
import { fetch as refreshFetch } from "@/lib/api/refreshFetch";

const API_BASE_URL = API_URL;

export const getUserInfo = (
    params?: TBody
  ): Promise<Response | IData<IUser>> => {
    let config = createConfig(params, {method: "POST", baseURL: API_BASE_URL});
    return fetch(config.baseURL + USER_INFO, config).then(
      handleReqMiddleware
    );
};

export const searchUserList = (
  params?: TBody<IUserByNameReq>
): Promise<Response | IData<IUserList>> => {
  let config = createConfig(params, {method: "POST", baseURL: API_BASE_URL});
  return refreshFetch(config.baseURL + SEARCH_USER_LIST, config).then(
    handleReqMiddleware
  );
};
