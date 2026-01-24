---
status: filled
generated: 2026-01-24
---

# Project Overview

Waba-bot is a multi-tenant SaaS platform designed for service-based businesses (e.g., barbershops, beauty salons) to manage their operations efficiently. It bridges the gap between traditional scheduling and modern communication by integrating WhatsApp Business API (WABA) for automated booking and Mercado Pago for seamless payment processing.

### Who benefits?
- **Tenants (Business Owners)**: Streamlined scheduling, automated reminders via WhatsApp, AI-powered conversational booking, and subscription-based revenue management.
- **Customers**: Easy booking experience through natural language conversations on WhatsApp and flexible payment options (PIX, Credit Card).

## Quick Facts

- Root path: `/home/gambal/gambs/waba-bot`
- Primary languages detected:
  - .ts (300+ files)
  - .tsx (25+ files)
  - .js (127 files)
  - .md (52+ files)

## Entry Points
- [`packages/api-types/src/index.ts`](packages/api-types/src/index.ts)
- [`apps/backend/src/main.ts`](apps/backend/src/main.ts)
- [`packages/api-types/src/interfaces/index.ts`](packages/api-types/src/interfaces/index.ts)
- [`apps/frontend/lib/auth/index.ts`](apps/frontend/lib/auth/index.ts)
- [`apps/backend/src/auth/index.ts`](apps/backend/src/auth/index.ts)
- [`apps/backend/src/ai/index.ts`](apps/backend/src/ai/index.ts) (NEW)

## Key Backend Modules

### Core Business Modules
- **Tenants**: Multi-tenant management, SaaS subscriptions, onboarding
- **Services**: Service catalog management (haircuts, treatments, etc.)
- **Appointments**: Booking engine with scheduling and availability
- **Customers**: Customer relationship management
- **Operating Hours**: Weekly schedule and business hours
- **Calendars**: External calendar integration (Google/Apple)

### Integration Modules
- **Payments**: Mercado Pago integration, webhooks, billing
- **WABA**: WhatsApp Business API integration, message processing
- **AI** (NEW): AI-powered conversational assistant with tool calling

### Infrastructure Modules
- **Auth**: JWT authentication, Google OAuth, role-based access
- **Prisma**: Database abstraction layer
- **Subscriptions**: SaaS plan management
- **Plans**: Customer-facing subscription plans

## Key Exports
**AI Module Classes (NEW):**
- [`AIModule`](apps/backend/src/ai/ai.module.ts#L29)
- [`LLMOrchestratorService`](apps/backend/src/ai/services/llm-orchestrator.service.ts#L41)
- [`ConversationService`](apps/backend/src/ai/services/conversation.service.ts)
- [`PromptBuilderService`](apps/backend/src/ai/services/prompt-builder.service.ts)
- [`ToolCoordinatorService`](apps/backend/src/ai/services/tool-coordinator.service.ts)
- [`AIAnalyticsService`](apps/backend/src/ai/services/ai-analytics.service.ts)
- [`GeminiProvider`](apps/backend/src/ai/providers/gemini.provider.ts)
- [`CheckAvailabilityTool`](apps/backend/src/ai/tools/availability.tool.ts)
- [`BookAppointmentTool`](apps/backend/src/ai/tools/booking.tool.ts)
- [`ListServicesTool`](apps/backend/src/ai/tools/services.tool.ts)

**Core Service Classes:**
- [`AppService`](apps/backend/src/app.service.ts#L4)
- [`AppModule`](apps/backend/src/app.module.ts#L50)
- [`AppController`](apps/backend/src/app.controller.ts#L7)
- [`TenantsService`](apps/backend/src/tenants/tenants.service.ts#L15)
- [`TenantSaasService`](apps/backend/src/tenants/tenant-saas.service.ts#L18)
- [`AppointmentsService`](apps/backend/src/appointments/appointments.service.ts#L17)
- [`PaymentsService`](apps/backend/src/payments/payments.service.ts#L10)
- [`MercadoPagoService`](apps/backend/src/payments/mercadopago.service.ts#L10)
- [`WabaController`](apps/backend/src/waba/waba.controller.ts#L8)
- [`WabaProcessor`](apps/backend/src/waba/waba.processor.ts#L6)

**Frontend Classes:**
- [`ApiError`](apps/frontend/lib/api/config.ts#L24)
- [`apiFetch`](apps/frontend/lib/api/config.ts#L80)
- [`useDashboard`](apps/frontend/lib/hooks/use-dashboard.ts) (NEW)
- [`apiClient`](apps/frontend/lib/api/client.ts) (NEW)

**Interfaces:**
- [`IUser`](packages/api-types/src/interfaces/user.ts#L6)
- [`ITenant`](packages/api-types/src/interfaces/tenant.ts#L6)
- [`IAppointment`](packages/api-types/src/interfaces/appointment.ts#L6)
- [`IService`](packages/api-types/src/interfaces/service.ts#L4)
- [`ProcessMessageInput`](apps/backend/src/ai/services/llm-orchestrator.service.ts#L16) (NEW)
- [`ProcessMessageResult`](apps/backend/src/ai/services/llm-orchestrator.service.ts#L28) (NEW)

## File Structure & Code Organization
- `anotacoes.md` — Shared notes and developer observations.
- `apps/` — Monorepo applications:
    - `/backend`: NestJS API handling business logic, WABA integration, AI, and payments.
    - `/frontend`: Next.js application for the user interface.
- `coverage/` — Automated test coverage reports.
- `implementations/` — Specific implementation details or reference code.
- `package.json` — Root dependencies and scripts for the monorepo.
- `packages/` — Shared workspace packages:
    - `api-types`: Common TypeScript interfaces and enums used by both frontend and backend.
- `pnpm-lock.yaml` — Dependency lockfile for pnpm.
- `pnpm-workspace.yaml` — Defines the pnpm workspace members.
- `README.md` — High-level project documentation.
- `turbo.json` — Turborepo configuration for task orchestration (build, lint, test).

## Technology Stack Summary

The project leverages a robust TypeScript-end-to-end stack to ensure type safety and developer productivity across the monorepo.

### Core Framework Stack
- **Backend**: NestJS (Node.js framework) providing a modular architecture.
- **Frontend**: Next.js (React framework) for a performant and SEO-friendly UI.
- **Database**: PostgreSQL with Prisma ORM for type-safe database access.
- **Task Orchestration**: Turborepo for efficient building and testing.
- **Message Queue**: BullMQ (Redis-backed) for processing background jobs like WABA webhooks and payment processing.

### AI & LLM Integration (NEW)
- **LLM Provider**: Google Gemini (configurable)
- **Architecture**: Tool-calling pattern with coordinator service
- **Features**: Conversation context management, prompt building, analytics tracking

### UI & Interaction Libraries
- **Styling**: Tailwind CSS for utility-first styling.
- **Components**: shadcn/ui (Radix UI primitives) for accessible, themed components.
- **Icons**: Lucide React.
- **Data Fetching**: React Query with custom API hooks (NEW)

### Development Tools Overview
- **Package Manager**: pnpm.
- **Linting & Formatting**: ESLint and Prettier.
- **Testing**: Jest for unit and integration tests, Playwright for E2E.

## Recent Updates (2026-01-24)

### AI Module Integration
- Full AI-powered conversational assistant for WhatsApp booking
- Tool calling for: availability checking, service listing, appointment booking
- Conversation context management with history
- Analytics and usage tracking

### Dashboard Enhancement
- React Query-based API integration
- Custom `useDashboard` hook for data fetching
- API client wrapper with type safety
- Dashboard pages: Home, Schedule, Customers, Catalog, Settings

### Code Quality
- Comprehensive test coverage for AI module
- Retry logic for LLM calls
- Improved message routing in WABA processor

## Getting Started Checklist

1. Install dependencies with `pnpm install`.
2. Set up environment variables in `apps/backend/.env` and `apps/frontend/.env.local`.
3. Set `AI_DEFAULT_MODEL` environment variable for AI features.
4. Run database migrations: `pnpm --filter backend prisma migrate dev`.
5. Start the development environment: `pnpm dev`.

## Next Steps

Capture product positioning, key stakeholders, and links to external documentation or product specs here.
