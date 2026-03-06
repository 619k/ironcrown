/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'avatars.steamstatic.com' },
            { protocol: 'https', hostname: 'steamcdn-a.akamaihd.net' },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                ],
            },
        ];
    },
};

export default nextConfig;
