import merge from 'lodash/merge'
import {ResponseBody, ResponseError} from './response';

const fetchJSON = (url: string | Request | URL, options: RequestInit) => {
  // The Content-Type header describes the type of the body so should be
  // omitted when there isn't one.
  const fetchOptions = typeof (options.body) !== 'undefined'
    ? options
    : merge(
      {
        headers: {
          'Content-Type': 'application/json'
        }
      },
      options
    )
    return fetch(url, fetchOptions)
  // return fetch(url, fetchOptions)
  //   .then((response: Response) => {
  //     return getResponseBody(response).then(body => ({
  //       response,
  //       body
  //     }))
  //   })
  //   .then(checkStatus)
}

const getResponseBody = (response: Response): Promise<ResponseBody> => {
  const contentType = response.headers.get('content-type')
  return contentType && contentType.indexOf('json') >= 0
    ? response.clone().text().then(tryParseJSON)
    : response.clone().text()
}

const tryParseJSON = (json: string): Object | null => {
  if (!json) {
    return null
  }

  try {
    return JSON.parse(json)
  } catch (e) {
    throw new Error(`Failed to parse unexpected JSON response: ${json}`)
  }
}

const checkStatus = ({ response, body }: { response: Response, body: ResponseBody }) => {
  if (response.ok) {
    return { response, body }
  } else {
    throw new ResponseError(response.status, response, body)
  }
}

export default fetchJSON
