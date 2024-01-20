import type { TParams } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import type { IData, IUser, IUserList } from '@/interfaces';
import { USER_INFO, SEARCH_USER_LIST, INVITE_COLLAB, EXIT_COLLAB } from '@/lib/constant';
import type { TBody } from '@/types';

export const getUserInfo = (
    params?: TParams
  ): Promise<Response | IData<IUser>> => {
    let config = createConfig(params, {method: "POST"});
    return fetch(config.baseURL + USER_INFO, config).then(
      handleReqMiddleware
    );
};

export const searchUserList = (
  params?: TBody<{name: string; page: number}>
): Promise<Response | IData<IUserList>> => {
  let config = createConfig(params, {method: "POST"});
  return fetch(config.baseURL + SEARCH_USER_LIST, config).then(
    handleReqMiddleware
  );
};
