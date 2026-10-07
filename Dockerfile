FROM oven/bun:1.2-alpine

WORKDIR /app

# Copy root manifests
COPY package.json tsconfig.base.json bun.lock* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/api/tsconfig.json ./apps/api/

# Copy sources
COPY packages/shared/src ./packages/shared/src
COPY apps/api/src ./apps/api/src

# Install workspace dependencies
RUN bun install --production

ENV NODE_ENV=production
ENV PORT=3001
EXPOSE 3001

CMD ["bun", "apps/api/src/index.ts"]
