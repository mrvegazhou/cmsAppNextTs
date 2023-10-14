import { NextRequest, NextResponse } from 'next/server';
import {
  apiAuthMiddleware,
  apiQueryBody,
  apiResponse,
  apiTokenData,
} from '@/lib/api';
import { loginByEmail } from '@/services/api';

export async function POST(request: NextRequest) {
  try {
    const response = (await loginByEmail({
        baseURL: process.env.APP_API_SERVER,
        token: apiAuthMiddleware(request),
        data: await apiQueryBody({
            request,
        }),
    })) as Response;
    
    const data = await response.json();
    return apiResponse({
      request,
      response,
      NextResponse,
      data,
      headers: apiTokenData(data.data),
    });
  } catch (e) {
    return apiResponse({ request, NextResponse, data: e, e });
  }
}
