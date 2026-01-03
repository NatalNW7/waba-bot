import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentPaymentValidator {
  constructor(private readonly prisma: PrismaService) {}

  async isPaymentApproved(paymentId: string): Promise<boolean> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });
    return payment?.status === 'APPROVED';
  }
}
