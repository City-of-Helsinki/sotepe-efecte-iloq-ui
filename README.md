# Efecte-iLOQ Integration UI

A web-based management interface for the Efecte-iLOQ integration system running on Kubernetes/OpenShift. This application provides manual operation capabilities for managing key synchronization between Efecte and iLOQ systems.

## Overview

This Next.js application provides:

- **Authentication**: Secure login with role-based access (Admin/Support)
- **Redis Integration**: Direct interface for managing Redis cache keys
- **Manual Operations**: Interface for manual key synchronization operations
- **Logging**: Structured logging with Pino for audit trails

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Shadcn/ui
- **Authentication**: NextAuth.js with JWT sessions
- **State Management**: TanStack Query (React Query)
- **Data Store**: Redis (ioredis client)
- **Testing**: Vitest + React Testing Library
- **Logging**: Pino
- **Containerization**: Docker + Docker Compose

## Quick Start

### Prerequisites

- Node.js 20 LTS or higher
- npm or yarn
- Docker and Docker Compose (for local development)
- Redis server (or use Docker Compose)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd efecte-iloq-integration-ui
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` file:

```bash
cp .env.example .env.local
```

4. Edit `.env.local` with your configuration:

```env
NEXTAUTH_SECRET=your-secret-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
SUPPORT_USERNAME=support
SUPPORT_PASSWORD=your-support-password
REDIS_HOST=localhost
REDIS_PORT=6379
```

5. Run the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Using Docker Compose

Start both the UI and Redis:

```bash
npm run docker:up
```

Stop services:

```bash
npm run docker:down
```

View logs:

```bash
npm run docker:logs
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run type-check` - Check TypeScript types

## Documentation

- [Developer Guide](docs/developer.md) - Detailed development instructions
- [User Guide](docs/user-guide.md) - End-user documentation
- [Stage 1 Specification](Efecte-iLOQ%20Integration%20UI%20-%20Stage%201%20Specification.md) - Complete technical specification

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (protected)/       # Protected routes (requires auth)
│   └── login/             # Login page
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   └── auth/             # Authentication components
├── lib/                   # Core libraries
│   ├── auth/             # Authentication logic
│   ├── redis/            # Redis client and operations
│   └── logger/           # Logging configuration
├── types/                 # TypeScript type definitions
├── __tests__/            # Test files
└── docs/                 # Documentation
```

## Environment Variables

See [.env.example](.env.example) for all required environment variables.

Key variables:

- `NEXTAUTH_SECRET` - Secret for JWT signing (generate with `openssl rand -base64 32`)
- `ADMIN_USERNAME/PASSWORD` - Admin user credentials
- `SUPPORT_USERNAME/PASSWORD` - Support user credentials
- `REDIS_HOST/PORT/PASSWORD` - Redis connection details

## Testing

Run tests:

```bash
npm test
```

Run with coverage:

```bash
npm run test:coverage
```

Target coverage: 90%+ for all metrics

## Deployment

### Building Docker Image

```bash
docker build -t efecte-iloq-ui:latest .
```

### Kubernetes/OpenShift

The application is designed to run on Kubernetes/OpenShift. Configure:

1. ConfigMap for non-sensitive environment variables
2. Secrets for credentials (from Azure Key Vault)
3. Service to expose the application
4. Ingress/Route for external access

## Security

- Credentials are never committed to the repository
- Environment variables are loaded from Azure Key Vault in production
- JWT-based sessions with 8-hour expiry
- All routes require authentication except login page
- Structured logging for audit trails

## License

[Add License Information]

## Support

For access requests or issues, contact:

- [Add Support Contact Information]

## Contributing

[Add Contributing Guidelines]
