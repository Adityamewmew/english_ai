FROM oven/bun:1.2-alpine AS builder

# Install Node.js for Next.js build (avoids Bun CJS page data collection bug)
RUN apk add --no-cache libc6-compat nodejs npm

WORKDIR /app

# Copy monorepo manifests
COPY package.json tsconfig.base.json bun.lock* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY apps/web/package.json ./apps/web/
COPY apps/web/tsconfig.json ./apps/web/
COPY apps/api/package.json ./apps/api/
COPY apps/api/tsconfig.json ./apps/api/

# Copy sources
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY apps/web ./apps/web
COPY data ./data

# Install all workspace dependencies
RUN bun install

# Build Next.js with standalone output using Node.js
WORKDIR /app/apps/web
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx next build

# Runner stage
FROM oven/bun:1.2-alpine AS runner
RUN apk add --no-cache nodejs
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy Next.js standalone build & static assets
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static

# Copy full dependencies and backend code for Elysia API + shared
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json /app/tsconfig.base.json ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api
COPY --from=builder /app/data ./data

EXPOSE 3000 3003

# Run Elysia API (port 3003 via Bun) and Next.js Web (port 3000 via Node) concurrently
CMD ["sh", "-c", "PORT=3003 bun run apps/api/src/index.ts & PORT=3000 HOSTNAME=0.0.0.0 API_URL=http://127.0.0.1:3003 exec node apps/web/server.js"]
