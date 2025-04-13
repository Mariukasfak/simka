/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['assets.zyrosite.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.webcontainer-api.io',
      },
      {
        protocol: 'https',
        hostname: 'assets.zyrosite.com',
      }
    ],
    unoptimized: true
  },
  experimental: {
    swcMinify: true,
    disableOptimizedLoading: true
  }
}

export default nextConfig