import { NextRequest, NextResponse } from 'next/server';
import { apiAuthMiddleware, apiResponse, createConfig, apiQueryBody } from '@/lib/api';
import { ARTICLE_DARFT_INFO } from '@/lib/constant'

export async function POST(request: NextRequest) {
    try {
        const config = createConfig({
            method: 'POST',
            baseURL: process.env.APP_API_SERVER,
            token: apiAuthMiddleware(request),
            data: await apiQueryBody({ request })
        });
        const response = await fetch(
            config.baseURL + ARTICLE_DARFT_INFO,
            config
        );
        const data = await response.json();

        return apiResponse({ request, response, NextResponse, data });
    } catch (e) {
        return apiResponse({ request, NextResponse, data: e, e });
    }
}