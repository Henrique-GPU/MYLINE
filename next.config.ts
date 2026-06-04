import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'liquipedia.net' },
      { protocol: 'https', hostname: 'img-cdn.hltv.org' },
      { protocol: 'https', hostname: 'assets.blast.tv' },
      { protocol: 'https', hostname: 'd3h9qea4qy4169.cloudfront.net' },
      { protocol: 'https', hostname: 'avatars.steamstatic.com' },
      { protocol: 'https', hostname: 'steamcdn-a.akamaihd.net' },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ],
      },
    ]
  },
}

export default nextConfig
