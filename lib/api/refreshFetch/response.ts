
export type ResponseBody = Object | null | string
export class ResponseError extends Error {
    status: number
    response: Response
    body: ResponseBody
    name: string = 'ResponseError'
    constructor(status: number, response: Response, body: ResponseBody) {
        super();
        this.status = status
        this.response = response
        this.body = body
    }
}