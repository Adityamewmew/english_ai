FROM oven/bun:1.2-alpine AS runner

WORKDIR /app

# Copy root monorepo config
COPY package.json tsconfig.base.json bun.lock* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/api/tsconfig.json ./apps/api/

# Copy sources
COPY packages/shared/src ./packages/shared/src
COPY apps/api/src ./apps/api/src
COPY data ./data

# Install production dependencies
RUN bun install --production

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["bun", "run", "src/index.ts"]
