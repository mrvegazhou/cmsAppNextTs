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
    async rewrites() {
        return [
            {
                source: '/sections/:id(\\D{1,})',
                destination: '/404',
            },
        ];
    },
    output: 'standalone',
    poweredByHeader: false,
}
if (process.env.APP_BASE_PATH) {
    nextConfig.basePath = process.env.APP_BASE_PATH + '';
}
module.exports = nextConfig

