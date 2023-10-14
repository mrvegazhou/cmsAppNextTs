import { NextRequest, NextResponse } from 'next/server';
import { apiAuthMiddleware, apiQueryBody, apiResponse } from '@/lib/api';
import { check4Captcha } from '@/services/api';

export async function POST(request: NextRequest) {
  try {
    const response = (await check4Captcha({
      method: 'POST',
      baseURL: process.env.APP_API_SERVER,
      token: apiAuthMiddleware(request),
      data: await apiQueryBody({ request }),
    })) as Response;

    return apiResponse({ request, response, NextResponse });
  } catch (e) {
    return apiResponse({ request, NextResponse, data: e, e });
  }
}
