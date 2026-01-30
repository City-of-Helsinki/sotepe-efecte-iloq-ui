# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Remove test directories and files from node_modules to avoid build issues
RUN find node_modules -type d -name "test" -o -name "tests" -o -name "__tests__" -o -name "spec" -o -name "specs" | xargs rm -rf || true
RUN find node_modules -name "*.test.js" -o -name "*.test.ts" -o -name "*.spec.js" -o -name "*.spec.ts" | xargs rm -f || true
RUN find node_modules -name "bench.js" -o -name "benchmark.js" -o -name "LICENSE" -o -name "README.md" -o -name "*.md" | xargs rm -f || true

# Copy source code
COPY . .

# Build application
RUN npm run build

# Ensure public directory exists (even if empty)
RUN mkdir -p public

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
