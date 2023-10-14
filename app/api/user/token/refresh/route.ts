import { NextRequest, NextResponse } from 'next/server';
import {
  apiClearToken,
  apiParseToken,
  apiResponse,
  apiResult,
  apiTokenData,
} from '@/lib/api';
import { refreshToken } from '@/services/api';

export async function GET(request: NextRequest) {
  try {
    const _token = apiParseToken(request);
    let headers = {};
    let data = apiResult({});
    if (_token) {
      const response = (await refreshToken({
        baseURL: process.env.APP_API_SERVER,
        token: _token.token,
        data: {
          refreshToken: _token.refreshToken,
        },
      })) as Response;

      data = await response.json();
      headers = apiTokenData(data.data);
    }
    return apiResponse({ request, NextResponse, data, headers });
  } catch (e) {
    return apiResponse({
      request,
      NextResponse,
      data: e,
      e,
      headers: apiClearToken(),
    });
  }
}

export const dynamic = 'force-dynamic';
