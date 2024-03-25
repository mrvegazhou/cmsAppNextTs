import {ResponseBody} from './response';

type Configuration = {
    refreshToken: () => Promise<ResponseBody>,
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
        // 根据状态码判断是否需要刷新token
        if (shouldRefreshToken(response)) {
              if (refreshingTokenPromise === null) {
                refreshingTokenPromise = new Promise<void>((resolve, reject) => {
                  refreshToken()
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
                  throw "redirect error: "+e
                })
                // 如果刷新成功则进行正常请求
                .then(() => fetch(url, options))
        } else {
          return response;
        }
        // return response;
      }).catch(error => {
        throw error
      })
    }
  }
  
  export default configureRefreshFetch