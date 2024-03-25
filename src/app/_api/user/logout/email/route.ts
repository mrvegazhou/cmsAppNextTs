import { NextRequest, NextResponse } from 'next/server';
import { apiAuthMiddleware, apiResponse } from '@/lib/api';
import { logout } from '@/services/api';

export async function POST(request: NextRequest) {
  try {
    const response = (await logout({
      baseURL: process.env.APP_API_SERVER,
      token: apiAuthMiddleware(request),
    })) as Response;
    const data = await response.json();
    return apiResponse({ request, response, NextResponse, data });
  } catch (e) {
    return apiResponse({ request, NextResponse, data: e, e });
  }
}

export const dynamic = 'force-dynamic';
