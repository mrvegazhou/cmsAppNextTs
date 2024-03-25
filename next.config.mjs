import nextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost', '127.0.0.1'],
        // enable dangerous use of SVG images
        dangerouslyAllowSVG: true,
        // sets the Content-Disposition header (inline or attachment)
        contentDispositionType: 'attachment',
        // set the Content-Security-Policy header
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        remotePatterns: [
        {
            protocol: 'https',
            hostname: '**',
        },
        {
            protocol: 'http',
            hostname: '**',
        },
        ],
    },
    eslint: {
        dirs: ['app', 'contexts', 'hooks'],
    },
    // output: 'standalone',
    poweredByHeader: false,
    reactStrictMode: false,
    // typescript: {
        // 禁用 noImplicitReturns 和 noImplicit 类型检查
        // ignoreBuildErrors: true,
        // compilerOptions: {
        //   noImplicitReturns: false,
        //   noImplicit: false,
        // },
    // },

    publicRuntimeConfig: {  
        // 这些值将在客户端可用  
        NEXT_PUBLIC_TEXT: 'Hello from publicRuntimeConfig',  
        // 其他需要在客户端使用的配置...  
    },  
    serverRuntimeConfig: {  
    // 这些值仅在服务器端可用  
    // ...  
    }, 
};

if (process.env.APP_BASE_PATH) {
    nextConfig.basePath = process.env.APP_BASE_PATH + '';
}

const withNextIntl = nextIntlPlugin(
    // Specify a custom next-intl path
    "./src/i18n.ts"
);
export default withNextIntl(nextConfig);
// export default nextConfig;
