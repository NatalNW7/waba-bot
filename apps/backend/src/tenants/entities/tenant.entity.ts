import { ApiProperty } from '@nestjs/swagger';
import { SubscriptionStatus } from '@prisma/client';
import { SaasPlanEntity } from '../../saas-plans/entities/saas-plan.entity';
import { CalendarEntity } from '../../calendars/entities/calendar.entity';
import { ServiceEntity } from '../../services/entities/service.entity';
import { AppointmentEntity } from '../../appointments/entities/appointment.entity';
import { CustomerEntity } from '../../customers/entities/customer.entity';
import { PlanEntity } from '../../plans/entities/plan.entity';
import { OperatingHourEntity } from '../../operating-hours/entities/operating-hour.entity';
import { PaymentEntity } from '../../payments/entities/payment.entity';

/**
 * Tenant entity representing a WhatsApp Business account holder
 */
export class TenantEntity {
  /** Unique identifier */
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  /** Business name */
  @ApiProperty({ example: 'My Barber Shop' })
  name: string;

  /** WhatsApp Business Account ID */
  @ApiProperty({ example: 'waba_123456789' })
  wabaId: string;

  /** WhatsApp phone number ID */
  @ApiProperty({ example: 'phone_987654321' })
  phoneId: string;

  /** Meta API access token */
  @ApiProperty({ example: 'EAAG...' })
  accessToken: string;

  /** Business email address */
  @ApiProperty({ example: 'contact@barbershop.com' })
  email: string;

  /** Contact phone number */
  @ApiProperty({ example: '+5511999999999', required: false })
  phone?: string;

  /** Mercado Pago Access Token */
  @ApiProperty({ example: 'APP_USR-...', required: false })
  mpAccessToken?: string;

  /** Mercado Pago Public Key */
  @ApiProperty({ example: 'APP_USR-...', required: false })
  mpPublicKey?: string;

  /** Mercado Pago Refresh Token */
  @ApiProperty({ example: 'TG-...', required: false })
  mpRefToken?: string;

  /** InfinitePay merchant tag */
  @ApiProperty({ example: 'barbershop-sp', required: false })
  infinitePayTag?: string;

  /** Preferred payment provider */
  @ApiProperty({
    enum: ['MERCADO_PAGO', 'INFINITE_PAY'],
    example: 'MERCADO_PAGO',
    required: false,
  })
  preferredPaymentProvider?: 'MERCADO_PAGO' | 'INFINITE_PAY';

  /** SaaS subscription status */
  @ApiProperty({ enum: SubscriptionStatus, example: 'ACTIVE' })
  saasStatus: SubscriptionStatus;

  /** Next SaaS billing date */
  @ApiProperty({ example: '2025-01-31T00:00:00Z', required: false })
  saasNextBilling?: Date;

  /** SaaS payment method ID */
  @ApiProperty({ example: 'pm_123', required: false })
  saasPaymentMethodId?: string;

  /** SaaS Plan ID */
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440003',
    required: false,
  })
  saasPlanId?: string;

  /** SaaS Plan relation */
  @ApiProperty({ type: () => SaasPlanEntity, required: false })
  saasPlan?: SaasPlanEntity;

  /** Calendar integration */
  @ApiProperty({ type: () => CalendarEntity, required: false })
  calendar?: CalendarEntity;

  /** List of services */
  @ApiProperty({ type: () => [ServiceEntity], required: false })
  services?: ServiceEntity[];

  /** List of appointments */
  @ApiProperty({ type: () => [AppointmentEntity], required: false })
  appointments?: AppointmentEntity[];

  /** List of customers */
  @ApiProperty({ type: () => [CustomerEntity], required: false })
  customers?: CustomerEntity[];

  /** Business plans for customers */
  @ApiProperty({ type: () => [PlanEntity], required: false })
  plans?: PlanEntity[];

  /** Business operating hours */
  @ApiProperty({ type: () => [OperatingHourEntity], required: false })
  operatingHours?: OperatingHourEntity[];

  /** Payments received */
  @ApiProperty({ type: () => [PaymentEntity], required: false })
  payments?: PaymentEntity[];

  /** Whether AI assistant is enabled */
  @ApiProperty({ example: true, default: true })
  aiEnabled: boolean;

  /** Custom system prompt for this tenant */
  @ApiProperty({
    example: 'Voce é um assistente de barbearia...',
    required: false,
  })
  aiCustomPrompt?: string;

  /** Creation timestamp */
  @ApiProperty()
  createdAt: Date;

  /** Last update timestamp */
  @ApiProperty()
  updatedAt: Date;
}
