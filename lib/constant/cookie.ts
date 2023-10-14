import cookie from 'js-cookie';
import { COOKIE_EXPIRES, TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/lib/constant';
import { aesEncryptStr, aesDecryptStr, decodeJwtExpToSeconds } from '@/lib/tool';
import { TOKEN_SECRET } from '@/lib/constant/app';

export const USER_TOKEN = {
    set: ({ token, refreshToken }: {token: string, refreshToken: string}) => {
         const tokenSeconds = decodeJwtExpToSeconds(token) as number ?? COOKIE_EXPIRES * 24 * 3600;
         let maxAge = new Date(Date.now() + tokenSeconds * 1000);
         cookie.set(TOKEN_NAME, aesEncryptStr(token, TOKEN_SECRET), { expires: maxAge });
         cookie.set(REFRESH_TOKEN_NAME, aesEncryptStr(refreshToken, TOKEN_SECRET), { expires: maxAge });
    },
    remove: () => {
       cookie.remove(TOKEN_NAME);
       cookie.remove(REFRESH_TOKEN_NAME);
    },
    get: function () {
      let token = cookie.get(TOKEN_NAME);
      let refreshToken = cookie.get(REFRESH_TOKEN_NAME);
      if(typeof token!='undefined') {
         refreshToken = aesDecryptStr(token as string, TOKEN_SECRET)
      }
      if(typeof refreshToken!='undefined') {
         refreshToken = aesDecryptStr(refreshToken as string, TOKEN_SECRET)
      }
      return {token: token, refreshToken: refreshToken}
    },
   //  get: () => ({
   //    token: cookie.get(TOKEN_NAME),
   //    refreshToken: cookie.get(REFRESH_TOKEN_NAME),
   // }),
    get notEmpty() {
       return this.get().token !== null;
   },
};