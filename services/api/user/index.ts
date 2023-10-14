import type { TParams } from '@/types';
import { createConfig, handleReqMiddleware } from '@/lib/api';
import type { IData, IUser } from '@/interfaces';
import { USER_INFO } from '@/lib/constant';


export const getUserInfo = (
    params?: TParams
  ): Promise<Response | IData<IUser>> => {
    let config = createConfig(params, {method: "POST"});
    return fetch(config.baseURL + USER_INFO, config).then(
      handleReqMiddleware
    );
};


