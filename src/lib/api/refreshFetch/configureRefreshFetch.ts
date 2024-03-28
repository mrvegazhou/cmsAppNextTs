import {ResponseBody} from './response';
import { USER_TOKEN } from "@/lib/constant/cookie";

type Configuration = {
    refreshToken: (token: string, refreshToken: string) => Promise<ResponseBody>,
    shouldRefreshToken: (error: any) => boolean,
    fetch: (url: any, options: Object) => Promise<any>
  }
  
  function configureRefreshFetch (configuration: Configuration) {
    const { refreshToken, shouldRefreshToken, fetch } = configuration
  
    let refreshingTokenPromise: any = null

    return (url: any, options: Object) => {
      
      // 需要刷新token
      if (refreshingTokenPromise !== null) {
        return (
          refreshingTokenPromise
            .then(() => fetch(url, options))
            // Even if the refreshing fails, do the fetch so we reject with
            // error of that request
            .catch(() => fetch(url, options))
        )
      }

      return fetch(url, options).then(response => {
        const token = USER_TOKEN.get();
        if (typeof token.refreshToken=='undefined' || typeof token.token=='undefined') {    
          return response;
        }
        // 根据状态码判断是否需要刷新token
        if (shouldRefreshToken(response)) {
              if (refreshingTokenPromise === null) {
                refreshingTokenPromise = new Promise<void>((resolve, reject) => {
                  console.log(token, "===token===w");
                  refreshToken(token.token!, token.refreshToken!)
                    .then(() => {
                      refreshingTokenPromise = null
                      resolve()
                    })
                    .catch(refreshTokenError => {
                      refreshingTokenPromise = null
                      reject(refreshTokenError)
                    })
                })
              }
              // 定义刷新token的fetch方法
              return refreshingTokenPromise
                .catch((e: any) => {
                  // If refreshing fails, continue with original error
                  throw "401:"+e
                })
                // 如果刷新成功则进行正常请求
                .then(() => fetch(url, options))
        } else {
          return response;
        }
        // return response;
      }).catch(error => {
        // console.log(error, 222)
        throw error
      })
    }
  }
  
  export default configureRefreshFetch