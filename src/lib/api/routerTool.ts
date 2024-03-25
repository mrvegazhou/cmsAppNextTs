/**
 * 这个是关于nextjs api route使用的工具库
 */
import type { IncomingMessage } from "http";
import type { NextApiRequestCookies } from "next/dist/server/api-utils";
import {
  CONTENT_TYPE,
  LOCATION,
  REFRESH_TOKEN_NAME,
  SET_COOKIE,
  TOKEN_NAME,
  X_POWERED_BY,
  X_RATE_LIMIT_REMAINING,
  X_RATE_LIMIT_RETRY_AFTER_MILLISECONDS,
} from "@/lib/constant";
import {
  aesDecryptStr,
  aesEncryptStr,
  decodeJwtExpToSeconds,
  isNull,
} from "@/lib/tool";
import type { RequestCookies } from "next/dist/server/web/spec-extension/cookies";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type {
  NextRequest as TNextRequest,
  NextResponse as TNextResponse,
} from "next/server";
import type { IData, IError, IToken } from "@/interfaces";
import { serializeCookie } from "@/lib/tool";


// 主要功能是从request获取cookie，并解码cookie中的值
export const authMiddleware = (
  req:
    | (IncomingMessage & { cookies: NextApiRequestCookies })
    | RequestCookies
    | ReadonlyRequestCookies
): string | undefined => {
  const tokenStr =
    "cookies" in req ? req.cookies[TOKEN_NAME] : req.get(TOKEN_NAME)?.value;
  return tokenStr
    ? aesDecryptStr(tokenStr, process.env.TOKEN_SECRET as string)
    : undefined;
};

// api route里获取cookie ，解码
export const apiAuthMiddleware = (
  request: TNextRequest
): string | undefined => {
  const requestCookies = request.cookies;
  const token = requestCookies.get(TOKEN_NAME)?.value;
  const refreshToken = requestCookies.get(REFRESH_TOKEN_NAME)?.value;
  if (
    requestCookies.has(TOKEN_NAME) &&
    token &&
    requestCookies.has(REFRESH_TOKEN_NAME)
  ) {
    return token != "undefined" && refreshToken != "undefined"
      ? aesDecryptStr(token, process.env.TOKEN_SECRET as string)
      : undefined;
  }
  return undefined;
};


// 从request获取链接中的请求数据
export const apiQueryParams = ({
  request,
  params,
  filter,
}: {
  request: TNextRequest;
  params?: any;
  filter?: {
    name: string;
    optional?: boolean;
  }[];
}) => {
  let _all: Record<string, any> = {};
  const { searchParams } = new URL(request.url);
  searchParams.forEach((value, key) => {
    _all[key] = value;
  });
  _all = { ..._all, ...params };

  filter
    ?.filter((value) => !value.optional)
    .forEach((value) => {
      const name = value.name;
      if (!(name in _all) || isNull(_all[name])) {
        throw apiException(400, `参数 [${name}] 不存在`);
      }
    });
  return _all;
};

// api route里通过request获取body请求数据
export const apiQueryBody = async ({
  request,
  type,
}: {
  request: TNextRequest;
  type?: "formData";
}): Promise<any> => {
  let body: any;
  if (type === "formData") {
    body = await request.formData();
    if (!(body instanceof FormData)) {
      throw apiException(400, "数据不存在");
    }
  } else {
    body = await request.json();
    if (typeof body !== "object") {
      throw apiException(400, "数据不存在");
    }
  }
  return body;
};

// 异常
export const apiException = (
  status = 500,
  message = "抱歉，发生了未知错误"
): IError => {
  return {
    status,
    message,
  };
};

// 返回api请求值
export const apiResult = ({
  data,
  status = 200,
  message = "OK",
}: {
  data?: any;
  status?: number;
  message?: string;
}): IData<any> => {
  return {
    data,
    status,
    message,
  };
};

export const apiResponse = ({
  request,
  response,
  NextResponse,
  data = {
    status: 200,
    message: "OK",
  },
  headers = {},
  status,
  e,
}: {
  request: TNextRequest;
  response?: Response;
  NextResponse: typeof TNextResponse;
  data?: any;
  headers?: Record<string, string>;
  status?: number;
  e?: any;
}) => {
  const _headers = { ..._getApiHeaders(response), ...headers };
  if (_headers[CONTENT_TYPE]?.startsWith("image")) {
    return new Response(data, {
      headers: _headers,
    });
  }
  return NextResponse.json(data, {
    headers: _headers,
    status:
      typeof data === "object" && "status" in data
        ? data.status > 599
          ? 599
          : data.status
        : status ?? (e ? 500 : 200),
  });
};

const _getApiHeaders = (response?: Response) => {
  const _headers: Record<string, string> = {
    [X_POWERED_BY]: "localhost",
  };

  if (!response) {
    return _headers;
  }

  const headers = response.headers;
  const location = headers.get(LOCATION);
  if (location) {
    _headers[LOCATION] = location;
  }

  const xRateLimitRemaining = headers.get(X_RATE_LIMIT_REMAINING);
  if (xRateLimitRemaining) {
    _headers[X_RATE_LIMIT_REMAINING] = xRateLimitRemaining;
  }

  const xRateLimitRetryAfterMilliseconds = headers.get(
    X_RATE_LIMIT_RETRY_AFTER_MILLISECONDS
  );
  if (xRateLimitRetryAfterMilliseconds) {
    _headers[X_RATE_LIMIT_RETRY_AFTER_MILLISECONDS] =
      xRateLimitRetryAfterMilliseconds;
  }

  const contentType = headers.get(CONTENT_TYPE);
  if (contentType) {
    _headers[CONTENT_TYPE] = contentType;
  }

  return _headers;
};

export const apiTokenData = ({ token, refreshToken }: IToken) => {
  if (!token || !refreshToken) {
    return {};
  }

  const tokenOptions: any = {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
  };
  const refreshTokenOptions: any = {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
  };

  if (
    process.env.NODE_ENV === "production" &&
    process.env.APP_URL_HTTPS === "true"
  ) {
    tokenOptions.secure = true;
    refreshTokenOptions.secure = true;
  }

  const tokenStr = aesEncryptStr(token, process.env.TOKEN_SECRET as string);
  const refreshTokenStr = aesEncryptStr(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as string
  );
  const tokenSeconds = decodeJwtExpToSeconds(token);

  if (tokenSeconds !== undefined) {
    tokenOptions.maxAge = tokenSeconds;
    refreshTokenOptions.maxAge = tokenSeconds;
  }

  return apiServerCookie([
    serializeCookie(TOKEN_NAME, tokenStr, tokenOptions),
    serializeCookie(REFRESH_TOKEN_NAME, refreshTokenStr, refreshTokenOptions),
  ]);
};

export const apiServerCookie = (
  value: number | string | ReadonlyArray<string>
) => {
  return {
    [SET_COOKIE]: value,
  };
};

export const apiClearToken = (): {} => {
  return apiServerCookie([
    serializeCookie(TOKEN_NAME, "", {
      path: "/",
      maxAge: 0,
    }),
    serializeCookie(REFRESH_TOKEN_NAME, "", {
      path: "/",
      maxAge: 0,
    }),
  ]);
};

export const apiParseToken = (request: TNextRequest) => {
  const requestCookies = request.cookies;
  const tokenStr = requestCookies.get(TOKEN_NAME)?.value;
  const refreshTokenStr = requestCookies.get(REFRESH_TOKEN_NAME)?.value;
  if (!tokenStr || !refreshTokenStr) {
    return;
  }

  const token = aesDecryptStr(
    refreshTokenStr,
    process.env.TOKEN_SECRET as string
  );
  const rToken = aesDecryptStr(
    refreshTokenStr,
    process.env.REFRESH_TOKEN_SECRET as string
  );
  if (!token || !rToken) {
    return;
  }

  return {
    token,
    refreshToken: rToken,
  };
};
