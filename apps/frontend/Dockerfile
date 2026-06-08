FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"

RUN apk add --no-cache libc6-compat

RUN corepack enable

# --- Stage 1: Install dependencies ---
FROM base AS deps
WORKDIR /app

# Copy monorepo root files needed for pnpm install
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy package.json for each workspace the frontend depends on
COPY apps/frontend/package.json ./apps/frontend/package.json
COPY packages/api-types/package.json ./packages/api-types/package.json

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# --- Stage 2: Build the application ---
FROM base AS build
WORKDIR /app

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

ARG NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY
ENV NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=$NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=deps /app/packages/api-types/node_modules ./packages/api-types/node_modules

# Copy workspace source files
COPY packages/api-types ./packages/api-types
COPY apps/frontend ./apps/frontend

# Copy root workspace config (needed by pnpm for workspace resolution)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Build the shared package first, then the frontend
RUN pnpm --filter @repo/api-types build
RUN pnpm --filter @waba-bot/frontend build

# --- Stage 3: Production runner (minimal — no npm/yarn/corepack) ---
FROM alpine:3.22 AS runner

# Only runtime libs needed by Node.js
RUN apk add --no-cache libc6-compat libstdc++ libgcc

WORKDIR /app
ENV NODE_ENV=production
ENV TZ=America/Sao_Paulo

# Copy only the Node.js binary from the build stage
COPY --from=base /usr/local/bin/node /usr/local/bin/node

RUN addgroup -S -g 1001 nodejs
RUN adduser -S -u 1001 -G nodejs nextjs
USER nextjs

# Copy Next.js standalone output
COPY --from=build --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

EXPOSE 8080
ENV HOSTNAME="0.0.0.0"
ENV PORT=8080

CMD ["node", "apps/frontend/server.js"]
