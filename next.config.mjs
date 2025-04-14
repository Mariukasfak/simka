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
    unoptimized: false // Įjungiame optimizaciją, tai pagerina svetainės veikimą
  },
  // Visada naudojame SWC, nes tai greičiau nei Babel
  swcMinify: true,
  
  // Šie nustatymai gerina svetainės veikimą
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  
  // Racionalesnis statinių puslapių generavimo laikas
  staticPageGenerationTimeout: 120,
  distDir: '.next',
  
  // Geresnė našumo optimizacija development režimui
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 valanda (ms)
    pagesBufferLength: 5
  },
  
  // Optimizuotas buildas Netlify platformai
  output: 'standalone',
  trailingSlash: false,
  
  // Modulių optimizavimas
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{member}}',
    },
  },
  
  // Eksperimentiniai funkcionalumai, kurie pagerina našumą
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['react-hot-toast', 'lucide-react', 'framer-motion'],
    serverActions: {
      bodySizeLimit: '2mb', // Padidintas dydis nuotraukoms
    },
    serverComponentsExternalPackages: [], // Nurodome išorinius paketus, kurie turi būti vykdomi serveryje
    esmExternals: 'loose', // Pagerina suderinamumą su ESM moduliais
    appDir: true, // Įgalina app/ direktoriją
    typedRoutes: true, // Tipizuoti maršrutai
    forceSwcTransforms: true, // Užtikrina, kad SWC transformacijos būtų naudojamos visur
  },
}

export default nextConfig