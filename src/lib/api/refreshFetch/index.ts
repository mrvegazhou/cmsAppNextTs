import merge from "lodash/merge";
import configureRefreshFetch from "@/lib/api/refreshFetch/configureRefreshFetch";
import fetchJSON from "@/lib/api/refreshFetch/fetchJson";
import { API_URL, REFRESH_TOKEN as REFRESH_TOKEN_URL } from "@/lib/constant";
import { USER_TOKEN } from "@/lib/constant/cookie";


const fetchJSONWithToken = (url: string, options: RequestInit = {}) => {
  const token = USER_TOKEN.get().token;
  let optionsWithToken = options;
  if (token != null && token != "") {
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

const refreshToken = (token: string, refreshToken: string) => {
  if (typeof refreshToken=='undefined' || typeof token=='undefined') {    
    throw "401: error refresh token";
  }
  
  return fetchJSONWithToken(API_URL + REFRESH_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ refreshToken:  refreshToken }),
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
