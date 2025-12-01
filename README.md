# Integration Management UI

A modern web-based management interface for system integrations with Redis-backed data storage. Built with Next.js and TypeScript for reliability and maintainability.

## Features

- **Secure Authentication**: Role-based access control with JWT sessions
- **Redis Integration**: Direct interface for managing cached data and configurations
- **Manual Operations**: Tools for managing synchronization operations
- **Comprehensive Testing**: Full test coverage with Vitest
- **Production Ready**: Docker support and structured logging

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Shadcn/ui
- **Authentication**: NextAuth.js
- **State Management**: TanStack Query
- **Database**: Redis
- **Testing**: Vitest + React Testing Library
- **Logging**: Pino

## Quick Start

### Prerequisites

- Node.js 20 LTS or higher
- Redis server (or use Docker Compose)

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration.

3. Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Using Docker Compose

Start the application with Redis:

```bash
docker-compose up -d
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm test` - Run tests
- `npm run test:coverage` - Generate coverage report
- `npm run type-check` - Check TypeScript types

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (protected)/       # Protected routes
│   └── login/             # Authentication
├── components/            # React components
├── lib/                   # Core libraries
│   ├── auth/             # Authentication
│   ├── redis/            # Redis operations
│   └── logger/           # Logging
├── types/                 # TypeScript definitions
└── __tests__/            # Test files
```

## Configuration

Key environment variables:

- `NEXTAUTH_SECRET` - JWT signing secret
- `REDIS_HOST` - Redis server host
- `REDIS_PORT` - Redis server port
- `REDIS_PASSWORD` - Redis authentication
- Authentication credentials (see `.env.example`)

## Testing

The project maintains high test coverage standards:

```bash
npm run test:coverage
```

Target: 90%+ coverage across all metrics

## Deployment

### Docker

Build production image:

```bash
docker build -t integration-ui:latest .
```

### Container Orchestration

The application is designed for container orchestration platforms. Configure using:

- ConfigMaps for environment variables
- Secrets for sensitive credentials
- Health check endpoints
- Horizontal pod autoscaling support

## Security

- All routes require authentication
- JWT-based sessions with configurable expiry
- Environment-based credential management
- Structured audit logging
- No sensitive data in repository

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For questions or issues, please open an issue in the repository.