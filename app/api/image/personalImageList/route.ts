import { NextRequest, NextResponse } from 'next/server';
import {
  apiAuthMiddleware,
  apiResponse,
  apiQueryBody
} from '@/lib/api';
import { getPersonalImageList } from '@/services/api/image';

export async function POST(request: NextRequest) {

    // fetch('http://localhost:3015/api/image/personalImageList', {
    //     method: 'POST',
    //     headers: {
    //         Authorization: `Bearer xxxx`,
    //         'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({ page: 1 }),
    // })
    //     .then((response) => response.json())
    //     .then((data) => console.log(data));
    try {
      const response = (await getPersonalImageList({
        method: 'POST',
        baseURL: process.env.APP_API_SERVER,
        // token: apiAuthMiddleware(request),
        data: await apiQueryBody({ request }),
      })) as Response;
      const data = await response.json();
      return apiResponse({ request, response, NextResponse, data });
    } catch (e) {
        console.log(e, "--ee--");
      return apiResponse({ request, NextResponse, data: e, e });
    }
}