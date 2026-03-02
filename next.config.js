const { withSentryConfig } = require('@sentry/nextjs')

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

// Sentry configuration
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: 'helsingin-kaupunki',
  project: 'efecte-iloq-integration-ui',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#extend-nextjs-configuration

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers
  tunnelRoute: '/monitoring',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,
}

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
