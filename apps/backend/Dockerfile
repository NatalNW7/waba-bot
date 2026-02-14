# ====================================
# Stage 1: Base
# ====================================
FROM node:22.22.0-slim AS base

ENV PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"
ENV CI=true

# OpenSSL is required by Prisma engine binaries
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable

# ====================================
# Stage 2: Install dependencies
# ====================================
FROM base AS deps
WORKDIR /app

# Copy monorepo root files needed for pnpm install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy backend package.json for workspace resolution
COPY apps/backend/package.json ./apps/backend/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# ====================================
# Stage 3: Build the application
# ====================================
FROM base AS build
WORKDIR /app

# Copy installed dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/node_modules ./apps/backend/node_modules

# Copy workspace source files
COPY apps/backend ./apps/backend

# Copy root workspace config (needed by pnpm for workspace resolution)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Generate Prisma client
RUN pnpm --filter @waba-bot/backend exec prisma generate

# Copy generated Prisma client to a known location for the runner stage
# Because pnpm stores it deep in node_modules/.pnpm, we find it dynamically
RUN mkdir -p /app/prisma-client && cp -r $(find /app/node_modules -type d -name .prisma -print -quit)/* /app/prisma-client/

# Build the NestJS application
RUN pnpm --filter @waba-bot/backend build

# Deploy production dependencies to a temporary folder
RUN pnpm --filter @waba-bot/backend deploy --prod --legacy /prod/backend

# ====================================
# Stage 4: Production runner
# ====================================
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Copy compiled application
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/dist ./dist

# Copy production-only node_modules from the deployed directory
COPY --from=build --chown=nestjs:nodejs /prod/backend/node_modules ./node_modules

# Copy Prisma schema + migrations (needed for prisma migrate deploy at runtime)
# Also copy package.json for Metadata
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/prisma ./prisma
COPY --from=build --chown=nestjs:nodejs /app/apps/backend/package.json ./package.json

# Copy the generated prisma client from our known location
COPY --from=build --chown=nestjs:nodejs /app/prisma-client ./node_modules/.prisma

EXPOSE 8081

CMD ["node", "dist/src/main.js"]
