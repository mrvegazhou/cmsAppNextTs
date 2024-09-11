import cookie from 'js-cookie';
import { COOKIE_EXPIRES, TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/lib/constant';
import { aesEncryptStr, aesDecryptStr } from '@/lib/tool';
import { TOKEN_SECRET } from '@/lib/constant/app';
import { jwtDecode } from 'jwt-decode';
import { isNullOrUnDefOrEmpty } from '../is';

export const USER_TOKEN = {
    set: ({ token, refreshToken }: {token: string, refreshToken: string}) => {
         // 获取到失效日期
         const exp = jwtDecode(token).exp;
         let maxAge;
         if (exp) {
            maxAge = new Date(exp*1000);
         } else {
            maxAge = new Date(Date.now() + COOKIE_EXPIRES * 24 * 3600);
         }
         cookie.set(TOKEN_NAME, aesEncryptStr(token, TOKEN_SECRET), { expires: maxAge });
         cookie.set(REFRESH_TOKEN_NAME, aesEncryptStr(refreshToken, TOKEN_SECRET), { expires: maxAge });
    },
    remove: () => {
       cookie.remove(TOKEN_NAME);
       cookie.remove(REFRESH_TOKEN_NAME);
    },
    get: function () {
      let token, refreshToken;
      try {
         token = cookie.get(TOKEN_NAME);
         refreshToken = cookie.get(REFRESH_TOKEN_NAME);
   
         if(!isNullOrUnDefOrEmpty(token)) {
            token = aesDecryptStr(token, TOKEN_SECRET)
         }
         if(!isNullOrUnDefOrEmpty(refreshToken)) {
            refreshToken = aesDecryptStr(refreshToken, TOKEN_SECRET)
         }
      } catch(e) {
         console.log(e);
         token = '';
         refreshToken = '';
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

export function setCookie(name: string, value: string, days: number) {
   const expires = new Date();
   expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
   document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}
export function getCookie (name: string) {
   const matches = document.cookie.match(
       new RegExp(
         `(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1")}=([^;]*)`
       )
     );
     return matches ? decodeURIComponent(matches[1]) : undefined;
}
export function delCookie (name: string) {
   setCookie(name, "", -1);
}