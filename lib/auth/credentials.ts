import { logger } from '../logger'

interface User {
  id: string
  username: string
  role: 'admin' | 'support'
}

export async function verifyCredentials(
  username: string,
  password: string
): Promise<User | null> {
  try {
    // Get credentials from environment variables (loaded from AKV)
    const adminUsername = process.env.ADMIN_USERNAME
    const adminPassword = process.env.ADMIN_PASSWORD
    const supportUsername = process.env.SUPPORT_USERNAME
    const supportPassword = process.env.SUPPORT_PASSWORD

    if (
      !adminUsername ||
      !adminPassword ||
      !supportUsername ||
      !supportPassword
    ) {
      logger.error('Authentication credentials not configured in environment')
      return null
    }

    // Verify admin credentials
    if (username === adminUsername && password === adminPassword) {
      logger.info({ username }, 'Admin login successful')
      return {
        id: 'admin',
        username: adminUsername,
        role: 'admin',
      }
    }

    // Verify support credentials
    if (username === supportUsername && password === supportPassword) {
      logger.info({ username }, 'Support user login successful')
      return {
        id: 'support',
        username: supportUsername,
        role: 'support',
      }
    }

    logger.warn({ username }, 'Login attempt with invalid credentials')
    return null
  } catch (error) {
    logger.error({ error, username }, 'Error during credential verification')
    return null
  }
}
