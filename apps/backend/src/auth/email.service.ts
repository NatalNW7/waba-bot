import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;

    if (!emailUser || !emailPassword) {
      this.logger.warn(
        'EMAIL_USER or EMAIL_PASSWORD not configured. Email sending will be mocked.',
      );
    }

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  }

  /**
   * Send email verification code
   */
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    const emailUser = process.env.EMAIL_USER;

    // Mock mode for development
    if (!emailUser) {
      this.logger.log(`[MOCK EMAIL] Verification code for ${email}: ${code}`);
      return;
    }

    const mailOptions = {
      from: {
        name: 'WABA Bot',
        address: emailUser,
      },
      to: email,
      subject: 'Verifique seu email - WABA Bot',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Verificação de Email</h2>
          <p style="color: #666; font-size: 16px; text-align: center;">
            Use o código abaixo para verificar seu email:
          </p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">
              ${code}
            </span>
          </div>
          <p style="color: #999; font-size: 14px; text-align: center;">
            Este código expira em 15 minutos.
          </p>
          <p style="color: #999; font-size: 12px; text-align: center;">
            Se você não solicitou este código, ignore este email.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw new Error('Falha ao enviar email de verificação');
    }
  }
}
