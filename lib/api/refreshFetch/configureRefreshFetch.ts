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
      if (refreshingTokenPromise !== null) {
        return (
          refreshingTokenPromise
            .then(() => fetch(url, options))
            // Even if the refreshing fails, do the fetch so we reject with
            // error of that request
            .catch(() => fetch(url, options))
        )
      }

      return fetch(url, options).catch(error => {
        if (shouldRefreshToken(error)) {
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
          
          return refreshingTokenPromise
            .catch(() => {
              // If refreshing fails, continue with original error
              throw error
            })
            .then(() => fetch(url, options))
        } else {
          throw error
        }
      })
    }
  }
  
  export default configureRefreshFetch