import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';
import { NotificationService } from './notification.service';
import {
  AppointmentNotificationData,
  CustomerNotificationData,
  TenantNotificationData,
} from './interfaces/notification.interface';

/**
 * Handles appointment status updates and notifications based on payment results.
 *
 * On APPROVED: updates appointment to CONFIRMED and sends success notification.
 * On FAILED: keeps appointment PENDING and sends failure notification.
 */
@Injectable()
export class AppointmentPaymentHandlerService {
  private readonly logger = new Logger(AppointmentPaymentHandlerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Process the payment result for an appointment — update status and dispatch notifications.
   */
  async handlePaymentResult(
    appointmentId: string,
    paymentStatus: PaymentStatus,
  ): Promise<void> {
    try {
      const appointment =
        await this.fetchAppointmentWithRelations(appointmentId);

      if (!appointment) {
        this.logger.warn(
          `Cannot send notification: missing data for appointment ${appointmentId}`,
        );
        return;
      }

      const notificationData = this.buildNotificationData(appointment);

      if (paymentStatus === PaymentStatus.APPROVED) {
        await this.handleApprovedPayment(appointmentId, notificationData);
      } else if (paymentStatus === PaymentStatus.FAILED) {
        await this.handleFailedPayment(appointmentId, notificationData);
      }
    } catch (error) {
      this.logger.error(
        `Error handling appointment payment result for ${appointmentId}:`,
        error,
      );
      // Don't re-throw: notifications should not break payment processing
    }
  }

  private async fetchAppointmentWithRelations(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        service: true,
        customer: true,
        tenant: true,
      },
    });

    if (!appointment || !appointment.service || !appointment.customer) {
      return null;
    }

    return appointment;
  }

  private buildNotificationData(appointment: {
    id: string;
    date: Date;
    price: any;
    service: { name: string };
    customer: { name: string; email: string | null; phone: string };
    tenant: { name: string; phoneId: string | null };
  }): {
    appointment: AppointmentNotificationData;
    customer: CustomerNotificationData;
    tenant: TenantNotificationData;
  } {
    return {
      appointment: {
        appointmentId: appointment.id,
        serviceName: appointment.service.name,
        date: appointment.date,
        price: Number(appointment.price),
      },
      customer: {
        name: appointment.customer.name,
        email: appointment.customer.email,
        phone: appointment.customer.phone,
      },
      tenant: {
        name: appointment.tenant.name,
        phoneId: appointment.tenant.phoneId,
      },
    };
  }

  private async handleApprovedPayment(
    appointmentId: string,
    data: {
      appointment: AppointmentNotificationData;
      customer: CustomerNotificationData;
      tenant: TenantNotificationData;
    },
  ): Promise<void> {
    await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CONFIRMED' },
    });
    this.logger.log(`Appointment ${appointmentId} confirmed after payment`);

    // Send success notification (fire-and-forget)
    this.notificationService
      .sendPaymentSuccessNotification(
        data.appointment,
        data.customer,
        data.tenant,
      )
      .catch((err) =>
        this.logger.error(
          `Failed to send success notification for ${appointmentId}:`,
          err,
        ),
      );
  }

  private async handleFailedPayment(
    appointmentId: string,
    data: {
      appointment: AppointmentNotificationData;
      customer: CustomerNotificationData;
      tenant: TenantNotificationData;
    },
  ): Promise<void> {
    this.logger.log(
      `Payment failed for appointment ${appointmentId}, status remains PENDING`,
    );

    // Send failure notification (fire-and-forget)
    this.notificationService
      .sendPaymentFailureNotification(
        data.appointment,
        data.customer,
        data.tenant,
      )
      .catch((err) =>
        this.logger.error(
          `Failed to send failure notification for ${appointmentId}:`,
          err,
        ),
      );
  }
}
