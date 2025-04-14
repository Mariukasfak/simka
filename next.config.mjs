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
  },
  // Diegimo greičio optimizacijos
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  staticPageGenerationTimeout: 300, // Padidintas timeout
  distDir: '.next',
  // Optimizavimas cache naudojimui
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 valanda (ms)
    pagesBufferLength: 5
  },
  // Išjungiame automatinį statinį generavimą puslapiams su dinaminiu turiniu
  output: 'standalone',
  // Netlify diegimui reikalingi nustatymai
  trailingSlash: false,
  // Teisingas metaduomenų bazinio URL nustatymas
  assetPrefix: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export default nextConfig