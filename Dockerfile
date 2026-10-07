FROM oven/bun:1.2-alpine

# Hugging Face Spaces user requirement (UID 1000)
RUN adduser -D -u 1000 user

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

RUN chown -R user:user /app

USER user
ENV HOME=/home/user
ENV NODE_ENV=production
ENV PORT=7860
EXPOSE 7860

CMD ["bun", "apps/api/src/index.ts"]
