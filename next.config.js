/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // External packages that should not be bundled (Next.js 16+)
  serverExternalPackages: ['pino', 'pino-pretty'],
}

module.exports = nextConfig
