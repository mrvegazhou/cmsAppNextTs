import { NextRequest, NextResponse } from 'next/server';
import {
  apiAuthMiddleware,
  apiQueryParams,
  apiResponse,
  createConfig,
} from '@/lib/api';
import { ARTICLE_PERSONAL_IMAGE_URL } from '@/lib/constant';

export async function GET(request: NextRequest, { params }: any) {
  try {
    const config = createConfig({
      baseURL: process.env.APP_API_SERVER,
      token: apiAuthMiddleware(request),
      name: apiQueryParams({
        request,
        params,
        filter: [
          {
            name: 'name',
          },
        ],
      }).name,
    });
    const response = await fetch(
      config.baseURL + ARTICLE_PERSONAL_IMAGE_URL + config.name,
      config
    );
    const data = await response.blob();
    return apiResponse({ request, response, NextResponse, data });
  } catch (e) {
    return apiResponse({ request, NextResponse, data: e, e });
  }
}