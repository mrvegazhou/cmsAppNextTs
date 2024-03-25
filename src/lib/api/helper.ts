import dayjs from "dayjs";
import type { TBody } from "@/types";
import { BASE_URL } from "@/lib/constant";


// 配置fetch 
export const createConfig = (
  target: TBody = {},
  source?: TBody
): TBody => {
  const token = source?.token ?? target?.token;
  const config = {
    ...source,
    ...target,
  };

  if (!config.baseURL) {
    config.baseURL = BASE_URL ?? "/api";
  }

  if (
    config.method === "POST" ||
    config.method === "PUT" ||
    config.method === "PATCH"
  ) {
    if (!config.body) {
      if (!config.headers) {
        config.headers = {
          "Content-Type": "application/json",
        };
      }

      const reqData = (config as TBody).data;
      if (reqData) {
        config.body = JSON.stringify(reqData);
      }
    }
  }
  config.mode = "cors";

  return token
    ? {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        },
      }
    : config;
};

export const isClient = () => {
  return typeof window !== "undefined";
};

export const handleReqMiddleware = async (
  response: Response,
  skipParse?: boolean
) => {
  // 如果有异常问题
  const headersLength = Object.keys(response.headers).length;
  if ( !response.ok &&
        (response.headers.get("content-type") === "application/json" ||
        headersLength === 0)
  ) {
    const reason = { status: 500, message: "未知错误", ...(await response.json()) };
    if (headersLength === 0) {
      throw reason;
    }
    throw { ...reason, headers: response.headers };
  } else {
    if (skipParse) {
      return response;
    }
    if ( isClient() && response.headers.get("content-type")?.includes("application/json") ) {
      return await response.json();
    }
    return response;
  }
};
