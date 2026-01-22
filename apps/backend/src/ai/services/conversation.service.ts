import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ConversationContext,
  ConversationMessage,
  TenantContext,
  CustomerContext,
  ServiceInfo,
  OperatingHourInfo,
} from '../interfaces/conversation.interface';

/**
 * Manages conversation context and history.
 * Uses in-memory cache for active conversations with database persistence.
 */
@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);
  private readonly conversationCache = new Map<string, ConversationContext>();
  private readonly CONVERSATION_TTL_MINUTES = 30;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get or create a conversation context for a customer-tenant pair.
   */
  async getOrCreateContext(
    tenantId: string,
    customerPhone: string,
  ): Promise<ConversationContext> {
    const cacheKey = this.getCacheKey(tenantId, customerPhone);

    // Check cache first
    const cached = this.conversationCache.get(cacheKey);
    if (cached && !this.isExpired(cached)) {
      return cached;
    }

    // Build new context
    const tenant = await this.fetchTenantContext(tenantId);
    const customer = await this.findOrCreateCustomer(tenantId, customerPhone);

    const context: ConversationContext = {
      conversationId: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenant,
      customer,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.conversationCache.set(cacheKey, context);
    return context;
  }

  /**
   * Append a message to the conversation.
   */
  appendMessage(
    context: ConversationContext,
    message: ConversationMessage,
  ): void {
    context.messages.push(message);
    context.updatedAt = new Date();

    // Update cache
    const cacheKey = this.getCacheKey(
      context.tenant.tenantId,
      context.customer.phone,
    );
    this.conversationCache.set(cacheKey, context);
  }

  /**
   * Clear a conversation context (e.g., after booking complete).
   */
  clearContext(tenantId: string, customerPhone: string): void {
    const cacheKey = this.getCacheKey(tenantId, customerPhone);
    this.conversationCache.delete(cacheKey);
  }

  /**
   * Get recent messages for context (last N messages).
   */
  getRecentMessages(
    context: ConversationContext,
    limit = 10,
  ): ConversationMessage[] {
    return context.messages.slice(-limit);
  }

  private getCacheKey(tenantId: string, customerPhone: string): string {
    return `${tenantId}:${customerPhone}`;
  }

  private isExpired(context: ConversationContext): boolean {
    const ttlMs = this.CONVERSATION_TTL_MINUTES * 60 * 1000;
    return Date.now() - context.updatedAt.getTime() > ttlMs;
  }

  private async fetchTenantContext(tenantId: string): Promise<TenantContext> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        services: true,
        operatingHours: true,
      },
    });

    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantId}`);
    }

    const services: ServiceInfo[] = tenant.services.map((s) => ({
      id: s.id,
      name: s.name,
      price: Number(s.price),
      duration: s.duration,
    }));

    const operatingHours: OperatingHourInfo[] = tenant.operatingHours.map(
      (oh) => ({
        day: oh.day,
        startTime: oh.startTime,
        endTime: oh.endTime,
        isClosed: oh.isClosed,
      }),
    );

    return {
      tenantId: tenant.id,
      tenantName: tenant.name,
      phoneId: tenant.phoneId || '',
      services,
      operatingHours,
    };
  }

  private async findOrCreateCustomer(
    tenantId: string,
    phone: string,
  ): Promise<CustomerContext> {
    // First, try to find existing customer
    let customer = await this.prisma.customer.findUnique({
      where: { phone },
    });

    if (!customer) {
      // Create new customer
      customer = await this.prisma.customer.create({
        data: { phone },
      });
      this.logger.log(
        `Created new customer: ${customer.id} for phone: ${phone}`,
      );
    }

    // Ensure tenant-customer link exists
    const existingLink = await this.prisma.tenantCustomer.findUnique({
      where: {
        tenantId_customerId: {
          tenantId,
          customerId: customer.id,
        },
      },
    });

    if (!existingLink) {
      await this.prisma.tenantCustomer.create({
        data: {
          tenantId,
          customerId: customer.id,
        },
      });
      this.logger.log(`Linked customer ${customer.id} to tenant ${tenantId}`);
    }

    return {
      customerId: customer.id,
      phone: customer.phone,
      name: customer.name || undefined,
    };
  }
}
