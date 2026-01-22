import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface UsageData {
  tenantId: string;
  promptTokens: number;
  completionTokens: number;
  model: string;
}

export interface ConversationMetrics {
  tenantId: string;
  success: boolean;
  toolsUsed: string[];
  responseTimeMs: number;
}

export interface TenantUsageSummary {
  tenantId: string;
  billingMonth: string;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalConversations: number;
  estimatedCost: number;
}

/**
 * Service for tracking AI usage and analytics.
 */
@Injectable()
export class AIAnalyticsService {
  private readonly logger = new Logger(AIAnalyticsService.name);

  // Cost per 1M tokens (Gemini 1.5 Flash)
  private readonly COST_PER_MILLION_PROMPT = 0.075;
  private readonly COST_PER_MILLION_COMPLETION = 0.3;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Track token usage for a tenant.
   */
  async trackUsage(data: UsageData): Promise<void> {
    try {
      const now = new Date();
      const billingMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      await this.prisma.aIUsage.create({
        data: {
          tenantId: data.tenantId,
          promptTokens: data.promptTokens,
          completionTokens: data.completionTokens,
          model: data.model,
          billingMonth,
        },
      });

      this.logger.debug(
        `Tracked usage for tenant ${data.tenantId}: ${data.promptTokens}/${data.completionTokens} tokens`,
      );
    } catch (error) {
      this.logger.error('Failed to track AI usage:', error);
    }
  }

  /**
   * Get usage summary for a tenant in a specific month.
   */
  async getUsageSummary(
    tenantId: string,
    billingMonth?: string,
  ): Promise<TenantUsageSummary> {
    const month = billingMonth || this.getCurrentBillingMonth();

    const result = await this.prisma.aIUsage.aggregate({
      where: {
        tenantId,
        billingMonth: month,
      },
      _sum: {
        promptTokens: true,
        completionTokens: true,
      },
      _count: {
        id: true,
      },
    });

    const totalPromptTokens = result._sum.promptTokens || 0;
    const totalCompletionTokens = result._sum.completionTokens || 0;

    // Calculate estimated cost
    const promptCost =
      (totalPromptTokens / 1_000_000) * this.COST_PER_MILLION_PROMPT;
    const completionCost =
      (totalCompletionTokens / 1_000_000) * this.COST_PER_MILLION_COMPLETION;
    const estimatedCost = promptCost + completionCost;

    return {
      tenantId,
      billingMonth: month,
      totalPromptTokens,
      totalCompletionTokens,
      totalConversations: result._count.id,
      estimatedCost: Math.round(estimatedCost * 10000) / 10000, // Round to 4 decimals
    };
  }

  /**
   * Get usage summary for all tenants in a billing month.
   */
  async getAllTenantsUsage(
    billingMonth?: string,
  ): Promise<TenantUsageSummary[]> {
    const month = billingMonth || this.getCurrentBillingMonth();

    const results = await this.prisma.aIUsage.groupBy({
      by: ['tenantId'],
      where: {
        billingMonth: month,
      },
      _sum: {
        promptTokens: true,
        completionTokens: true,
      },
      _count: {
        id: true,
      },
    });

    return results.map((r) => {
      const totalPromptTokens = r._sum.promptTokens || 0;
      const totalCompletionTokens = r._sum.completionTokens || 0;
      const promptCost =
        (totalPromptTokens / 1_000_000) * this.COST_PER_MILLION_PROMPT;
      const completionCost =
        (totalCompletionTokens / 1_000_000) * this.COST_PER_MILLION_COMPLETION;

      return {
        tenantId: r.tenantId,
        billingMonth: month,
        totalPromptTokens,
        totalCompletionTokens,
        totalConversations: r._count.id,
        estimatedCost:
          Math.round((promptCost + completionCost) * 10000) / 10000,
      };
    });
  }

  /**
   * Get daily usage breakdown for a tenant.
   */
  async getDailyUsage(tenantId: string, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const usage = await this.prisma.aIUsage.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        promptTokens: true,
        completionTokens: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by day
    const dailyMap = new Map<
      string,
      { promptTokens: number; completionTokens: number; count: number }
    >();

    for (const u of usage) {
      const day = u.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(day) || {
        promptTokens: 0,
        completionTokens: 0,
        count: 0,
      };
      dailyMap.set(day, {
        promptTokens: existing.promptTokens + u.promptTokens,
        completionTokens: existing.completionTokens + u.completionTokens,
        count: existing.count + 1,
      });
    }

    return Array.from(dailyMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    }));
  }

  private getCurrentBillingMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
}
