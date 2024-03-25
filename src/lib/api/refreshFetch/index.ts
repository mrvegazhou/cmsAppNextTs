import merge from "lodash/merge";
import configureRefreshFetch from "@/lib/api/refreshFetch/configureRefreshFetch";
import fetchJSON from "@/lib/api/refreshFetch/fetchJson";
import { ResponseError } from "./response";
import { USER_TOKEN } from "@/lib/constant/cookie";
import { REFRESH_TOKEN as REFRESH_TOKEN_URL } from "@/lib/constant";

const fetchJSONWithToken = (url: string, options: RequestInit = {}) => {
  const token = USER_TOKEN.get().token;

  let optionsWithToken = options;
  if (token != null) {
    optionsWithToken = merge({}, options, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return fetchJSON(url, optionsWithToken);
};

const shouldRefreshToken = (response: Response) => {  
  return response.status === 401;
};

const refreshToken = () => {
  const token = USER_TOKEN.get();
  if (typeof token.refreshToken=='undefined' || typeof token.token=='undefined') {
   throw "redirect login: error refresh token";
  }
  return fetchJSONWithToken(REFRESH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token.token}`,
    },
    body: JSON.stringify({ refreshToken:  token.refreshToken }),
  })
    .then((response) => {
      // @ts-ignore
      USER_TOKEN.set({token: response.body.token, refreshToken: response.body.refreshToken})
      return response;
    })
    .catch((error) => {
      // If we failed by any reason in refreshing, just clear the token,
      // it's not that big of a deal
      // USER_TOKEN.remove();
      throw error;
    });
};

export const fetch = configureRefreshFetch({
  shouldRefreshToken,
  refreshToken,
  fetch: fetchJSONWithToken,
});
