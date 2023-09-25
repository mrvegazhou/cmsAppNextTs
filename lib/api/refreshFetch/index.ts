import merge from 'lodash/merge'
import configureRefreshFetch from '@/lib/api/refreshFetch/configureRefreshFetch';
import fetchJSON from '@/lib/api/refreshFetch/fetchJson';
import {ResponseError} from './response';
import { USER_TOKEN } from '@/lib/constant/cookie';


const fetchJSONWithToken = (url: string, options:RequestInit = {}) => {
    const token = USER_TOKEN.get().token;
  
    let optionsWithToken = options
    if (token != null) {
      optionsWithToken = merge({}, options, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    }
  
    return fetchJSON(url, optionsWithToken)
}

const shouldRefreshToken = (error: ResponseError) =>
  error.response.status === 401

const refreshToken = () => {
    return fetchJSONWithToken('/api/refresh-token', {
        method: 'POST'
    }).then(
        response => {
            // @ts-ignore
            USER_TOKEN.set({token: response.body.token, refreshToken: response.body.refreshToken})
            return response
    }).catch(
        error => {
            // If we failed by any reason in refreshing, just clear the token,
            // it's not that big of a deal
            USER_TOKEN.remove();
            throw error
    })
}

export const fetch = configureRefreshFetch({
    shouldRefreshToken,
    refreshToken,
    fetch: fetchJSONWithToken,
})

