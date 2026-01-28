export class InfinitePayWebhookPayload {
  invoice_slug?: string;
  slug?: string;
  amount?: number;
  paid_amount?: number;
  paid?: boolean;
  success?: boolean;
  status?: string;
  capture_method?: string;
  transaction_nsu?: string;
}
