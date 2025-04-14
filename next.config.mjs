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
  staticPageGenerationTimeout: 120,
  distDir: '.next', // Užtikrina kad būtų naudojamas teisingas direktorijos pavadinimas
  // Optimizavimas cache naudojimui
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 valanda (ms)
    pagesBufferLength: 5
  }
}

export default nextConfig