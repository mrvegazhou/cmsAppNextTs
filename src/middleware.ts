import createIntlMiddleware from "next-intl/middleware";
// import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { defaultLocale, localePrefix, locales } from '@/lib/constant/locales';

// export default createMiddleware({
//     locales,
//     localePrefix ,
//     defaultLocale,
//     localeDetection: false,
// });

export default async function middleware(request: NextRequest) {
    // Step 1: Use the incoming request (example)
    // const defaultLocale = request.headers.get('x-locale') || (defaultLocale);
   
    // Step 2: Create and call the next-intl middleware (example)
    const handleI18nRouting = createIntlMiddleware({
      locales: locales,
      defaultLocale,
      localePrefix,
      localeDetection: false,
    });
    const response = handleI18nRouting(request);
   
    // Step 3: Alter the response (example)
    response.headers.set('x-locale', defaultLocale);
    
    return response;
}
  
export const config = {
    // Skip all paths that should not be internationalized.
    // This skips the folders "api", "_next" and all files
    // with an extension (e.g. favicon.ico)
    matcher: ["/((?!api|_next|.*\\..*).*)"],
};