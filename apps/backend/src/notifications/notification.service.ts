import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import WabaAPI from '../waba/waba.api';
import {
  AppointmentNotificationData,
  CustomerNotificationData,
  TenantNotificationData,
} from './interfaces/notification.interface';

/**
 * Generic notification service for sending email and WhatsApp messages.
 * Handles payment success/failure notifications for appointments.
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private transporter: nodemailer.Transporter;
  private readonly emailUser: string | undefined;

  constructor(private readonly configService: ConfigService) {
    this.emailUser = this.configService.get<string>('EMAIL_USER');
    const emailPassword = this.configService.get<string>('EMAIL_PASSWORD');

    if (!this.emailUser || !emailPassword) {
      this.logger.error('EMAIL_USER or EMAIL_PASSWORD not configured');
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.emailUser,
        pass: emailPassword,
      },
    });
  }

  /**
   * Send payment success notification (email + WhatsApp).
   * Informs the customer that payment was received and appointment is confirmed.
   */
  async sendPaymentSuccessNotification(
    appointment: AppointmentNotificationData,
    customer: CustomerNotificationData,
    tenant: TenantNotificationData,
  ): Promise<void> {
    const customerName = customer.name;
    const formattedDate = this.formatDate(appointment.date);
    const formattedPrice = this.formatPrice(appointment.price);

    // Send email notification
    if (customer.email) {
      await this.sendEmail(
        customer.email,
        `✅ Pagamento confirmado - ${tenant.name}`,
        this.buildPaymentSuccessEmailHtml(
          customerName,
          tenant.name,
          appointment.serviceName,
          formattedDate,
          formattedPrice,
        ),
      );
    }

    // Send WhatsApp notification
    if (tenant.phoneId) {
      const whatsappMessage =
        `✅ *Pagamento confirmado!*\n\n` +
        `Olá ${customerName}! Seu pagamento de ${formattedPrice} foi recebido com sucesso.\n\n` +
        `📋 *Detalhes do agendamento:*\n` +
        `• Serviço: ${appointment.serviceName}\n` +
        `• Data: ${formattedDate}\n` +
        `• Status: *Confirmado*\n\n` +
        `Obrigado pela preferência! 😊`;

      await this.sendWhatsApp(tenant.phoneId, customer.phone, whatsappMessage);
    }
  }

  /**
   * Send payment failure notification (email + WhatsApp).
   * Informs the customer that payment failed and appointment remains pending.
   */
  async sendPaymentFailureNotification(
    appointment: AppointmentNotificationData,
    customer: CustomerNotificationData,
    tenant: TenantNotificationData,
  ): Promise<void> {
    const customerName = customer.name;
    const formattedDate = this.formatDate(appointment.date);
    const formattedPrice = this.formatPrice(appointment.price);

    // Send email notification
    if (customer.email) {
      await this.sendEmail(
        customer.email,
        `❌ Pagamento não aprovado - ${tenant.name}`,
        this.buildPaymentFailureEmailHtml(
          customerName,
          tenant.name,
          appointment.serviceName,
          formattedDate,
          formattedPrice,
        ),
      );
    }

    // Send WhatsApp notification
    if (tenant.phoneId) {
      const whatsappMessage =
        `❌ *Pagamento não aprovado*\n\n` +
        `Olá ${customerName}, infelizmente seu pagamento de ${formattedPrice} não foi aprovado.\n\n` +
        `📋 *Detalhes do agendamento:*\n` +
        `• Serviço: ${appointment.serviceName}\n` +
        `• Data: ${formattedDate}\n` +
        `• Status: *Pendente*\n\n` +
        `Por favor, tente novamente ou entre em contato conosco.`;

      await this.sendWhatsApp(tenant.phoneId, customer.phone, whatsappMessage);
    }
  }

  /**
   * Send a generic email
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    if (!this.emailUser) {
      this.logger.warn(`[MOCK EMAIL] To: ${to}, Subject: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: { name: 'WABA Bot', address: this.emailUser },
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      // Fire-and-forget: don't throw, notifications shouldn't break payment flow
    }
  }

  /**
   * Send a WhatsApp message
   */
  private async sendWhatsApp(
    phoneId: string,
    to: string,
    message: string,
  ): Promise<void> {
    try {
      const wabaApi = WabaAPI();
      await wabaApi.sendMessage(phoneId, to, message);
      this.logger.log(`WhatsApp message sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp to ${to}:`, error);
      // Fire-and-forget: don't throw
    }
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: 'America/Sao_Paulo',
    }).format(date);
  }

  private formatPrice(price: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  }

  private buildPaymentSuccessEmailHtml(
    customerName: string,
    tenantName: string,
    serviceName: string,
    formattedDate: string,
    formattedPrice: string,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ Pagamento Confirmado</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px;">Olá <strong>${customerName}</strong>,</p>
          <p style="color: #6b7280; font-size: 15px;">Seu pagamento foi recebido com sucesso! Seu agendamento está confirmado.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="color: #6b7280; padding: 8px 0;">Estabelecimento:</td><td style="color: #111827; font-weight: bold; text-align: right;">${tenantName}</td></tr>
              <tr><td style="color: #6b7280; padding: 8px 0;">Serviço:</td><td style="color: #111827; font-weight: bold; text-align: right;">${serviceName}</td></tr>
              <tr><td style="color: #6b7280; padding: 8px 0;">Data:</td><td style="color: #111827; font-weight: bold; text-align: right;">${formattedDate}</td></tr>
              <tr><td style="color: #6b7280; padding: 8px 0;">Valor:</td><td style="color: #10b981; font-weight: bold; text-align: right;">${formattedPrice}</td></tr>
              <tr><td style="color: #6b7280; padding: 8px 0;">Status:</td><td style="color: #10b981; font-weight: bold; text-align: right;">Confirmado ✅</td></tr>
            </table>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center;">Obrigado pela preferência!</p>
        </div>
      </div>
    `;
  }

  private buildPaymentFailureEmailHtml(
    customerName: string,
    tenantName: string,
    serviceName: string,
    formattedDate: string,
    formattedPrice: string,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">❌ Pagamento Não Aprovado</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
          <p style="color: #374151; font-size: 16px;">Olá <strong>${customerName}</strong>,</p>
          <p style="color: #6b7280; font-size: 15px;">Infelizmente seu pagamento não foi aprovado. Seu agendamento continua pendente.</p>
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="color: #6b7280; padding: 8px 0;">Estabelecimento:</td><td style="color: #111827; font-weight: bold; text-align: right;">${tenantName}</td></tr>
              <tr><td style="color: #6b7280; padding: 8px 0;">Serviço:</td><td style="color: #111827; font-weight: bold; text-align: right;">${serviceName}</td></tr>
              <tr><td style="color: #6b7280; padding: 8px 0;">Data:</td><td style="color: #111827; font-weight: bold; text-align: right;">${formattedDate}</td></tr>
              <tr><td style="color: #6b7280; padding: 8px 0;">Valor:</td><td style="color: #ef4444; font-weight: bold; text-align: right;">${formattedPrice}</td></tr>
              <tr><td style="color: #6b7280; padding: 8px 0;">Status:</td><td style="color: #ef4444; font-weight: bold; text-align: right;">Pendente ⏳</td></tr>
            </table>
          </div>
          <p style="color: #6b7280; font-size: 14px; text-align: center;">Por favor, tente novamente ou entre em contato conosco.</p>
        </div>
      </div>
    `;
  }
}
