import cookie from 'js-cookie';
import { COOKIE_EXPIRES, TOKEN_NAME, REFRESH_TOKEN_NAME } from '@/lib/constant';

export const USER_TOKEN = {
    set: ({ token, refreshToken }: {token: string, refreshToken: string}) => {
        cookie.set(TOKEN_NAME, token, { expires: COOKIE_EXPIRES });
        cookie.set(REFRESH_TOKEN_NAME, refreshToken, { expires: COOKIE_EXPIRES });
    },
    remove: () => {
       cookie.remove(TOKEN_NAME);
       cookie.remove(REFRESH_TOKEN_NAME);
    },
    get: () => ({
      token: cookie.get(TOKEN_NAME),
      refreshToken: cookie.get(REFRESH_TOKEN_NAME),
   }),
    get notEmpty() {
       return this.get().token !== null;
   },
};