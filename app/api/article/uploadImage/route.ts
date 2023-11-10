import { NextRequest, NextResponse } from 'next/server';
import { 
  apiAuthMiddleware, 
  apiQueryBody, 
  apiQueryParams,
  apiResponse,
  createConfig 
} from '@/lib/api';
import { uploadArticleImages } from '@/services/api';
import { 
  ARTICLE_UPLOAD_IMAGE
} from '@/lib/constant'

export async function POST(request: NextRequest) {
  try {
    const config = createConfig({
      method: 'POST',
      baseURL: process.env.APP_API_SERVER,
      body: await apiQueryBody({
        request,
        type: 'formData',
      }),
      token: apiAuthMiddleware(request)
    });
    const response = await fetch(
      config.baseURL + ARTICLE_UPLOAD_IMAGE,
      config
    );
    const data = await response.json();
    return apiResponse({ request, response, NextResponse, data });
  } catch (e) {
    return apiResponse({ request, NextResponse, data: e, e });
  }
}
