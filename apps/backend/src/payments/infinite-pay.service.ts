import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InfinitePayWebhookPayload } from './dto/infinite-pay.dto';

@Injectable()
export class InfinitePayService {
  private readonly logger = new Logger(InfinitePayService.name);
  private readonly BASE_URL;

  constructor(private readonly configService: ConfigService) {
    this.BASE_URL = this.configService.get<string>('INFINITE_PAY_API_URL');
  }

  /**
   * Creates a checkout link via InfinitePay API
   */
  async createCheckoutLink(params: {
    handle: string;
    amount: number; // in cents
    order_nsu: string;
    webhook_url: string;
    description: string;
    customer: {
      name?: string | null;
      email?: string | null;
      phone_number?: string | null;
    };
  }) {
    const payload = {
      handle: params.handle,
      items: [
        {
          description: params.description,
          quantity: 1,
          price: params.amount,
        },
      ],
      order_nsu: params.order_nsu,
      webhook_url: params.webhook_url,
      customer: params.customer,
    };

    try {
      const response = await fetch(`${this.BASE_URL}/links`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `Failed to create InfinitePay link: ${response.status} ${response.statusText} - ${errorBody}`,
        );
        throw new InternalServerErrorException(
          'Failed to create checkout link with InfinitePay',
        );
      }

      // InfinitePay returns the created link info.
      // The response is: { "url": "..." }
      return await response.json();
    } catch (error) {
      this.logger.error(`Error creating checkout link: ${error}`);
      throw error;
    }
  }

  /**
   * Checks the status of a payment via InfinitePay API
   * Endpoint: /payment_check
   */
  async checkPaymentStatus(params: {
    handle: string;
    order_nsu: string;
    transaction_nsu?: string;
    slug?: string;
  }) {
    const payload = {
      handle: params.handle,
      order_nsu: params.order_nsu,
      transaction_nsu: params.transaction_nsu,
      slug: params.slug,
    };

    try {
      const response = await fetch(`${this.BASE_URL}/payment_check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        this.logger.error(
          `Failed to check payment status: ${response.status} ${response.statusText} - ${errorBody}`,
        );
        return null; // or throw
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Error checking payment status: ${error}`);
      throw error;
    }
  }

  /**
   * Processes webhook notification and returns normalized payment data
   */
  async processWebhookNotification(
    targetId: string,
    orderNsu: string,
    payload: InfinitePayWebhookPayload,
    tenantInfinitePayTag: string | null,
  ): Promise<InfinitePayWebhookPayload> {
    let data = { ...payload };

    if (data.paid === undefined && !data.status) {
      if (!tenantInfinitePayTag) {
        this.logger.error(
          `Tenant ${targetId} has no InfinitePay tag configured.`,
        );
        return data;
      }

      const checkResult = await this.checkPaymentStatus({
        handle: tenantInfinitePayTag,
        order_nsu: orderNsu,
        slug: data.invoice_slug || data.slug,
      });

      if (checkResult) {
        data = { ...data, ...checkResult };
      }
    }

    return data;
  }
}
