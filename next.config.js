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
  // This prevents Turbopack from trying to bundle test files and dev dependencies
  serverExternalPackages: [
    'pino',
    'pino-pretty',
    'thread-stream',
    'sonic-boom',
    'pino-std-serializers',
    'pino-abstract-transport',
    'real-require',
  ],
}

module.exports = nextConfig
