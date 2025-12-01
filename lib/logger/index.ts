import pino from 'pino'

const logLevel = process.env.LOG_LEVEL || 'info'

// Create logger without pino-pretty to avoid worker thread issues in Next.js
export const logger = pino({
  level: logLevel,
  formatters: {
    level: label => {
      return { level: label }
    },
  },
})
