import type { IncomingMessage } from 'http';
import type { NextApiRequestCookies } from 'next/dist/server/api-utils';
import {
    CONTENT_TYPE,
    LOCATION,
    REFRESH_TOKEN_NAME,
    SET_COOKIE,
    TOKEN_NAME,
    X_POWERED_BY,
    X_RATE_LIMIT_REMAINING,
    X_RATE_LIMIT_RETRY_AFTER_MILLISECONDS,
} from '@/lib/constant';
import {
    aesDecryptStr,
    aesEncryptStr,
    decodeJwtExpToSeconds,
    isNull,
} from '@/lib/tool';
import type { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import type {
    NextRequest as TNextRequest,
    NextResponse as TNextResponse,
} from 'next/server';
import type { IData, IError, IToken } from '@/interfaces';
import { serializeCookie } from '@/lib/api/helper';


export const authMiddleware = (
    req:
      | (IncomingMessage & { cookies: NextApiRequestCookies })
      | RequestCookies
      | ReadonlyRequestCookies
): string | undefined => {
    const tokenStr =
      'cookies' in req ? req.cookies[TOKEN_NAME] : req.get(TOKEN_NAME)?.value;
    console.log(tokenStr, "---tokenStr----");
    return tokenStr
      ? aesDecryptStr(tokenStr, process.env.TOKEN_SECRET as string)
      : undefined;
};
  