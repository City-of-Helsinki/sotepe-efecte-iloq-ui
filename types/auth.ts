import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      role: 'admin' | 'support'
      username: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    username: string
    role: 'admin' | 'support'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'admin' | 'support'
    username: string
  }
}
