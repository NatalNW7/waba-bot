FROM node:22.22.0-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH="${PNPM_HOME}:${PATH}"

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

# --- Stage 3: Production runner ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy Next.js standalone output
COPY --from=build --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=build --chown=nextjs:nodejs /app/apps/frontend/public ./apps/frontend/public

EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

CMD ["node", "apps/frontend/server.js"]
