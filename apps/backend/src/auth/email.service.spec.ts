import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  }),
}));

describe('EmailService', () => {
  let service: EmailService;
  let sendMailMock: jest.Mock;

  beforeEach(async () => {
    // Reset environment for each test
    process.env.EMAIL_USER = 'test@gmail.com';
    process.env.EMAIL_PASSWORD = 'test-password';

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);

    // Get the mocked sendMail function
    const nodemailer = require('nodemailer');
    sendMailMock = nodemailer.createTransport().sendMail;

    jest.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.EMAIL_USER;
    delete process.env.EMAIL_PASSWORD;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendVerificationEmail', () => {
    it('should send email with verification code', async () => {
      await service.sendVerificationEmail('user@example.com', '123456');

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'user@example.com',
          subject: expect.stringContaining('Verifique seu email'),
          html: expect.stringContaining('123456'),
        }),
      );
    });

    it('should use EMAIL_USER as sender', async () => {
      await service.sendVerificationEmail('user@example.com', '123456');

      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.objectContaining({
            address: 'test@gmail.com',
          }),
        }),
      );
    });

    it('should log mock message when EMAIL_USER not configured', async () => {
      // Clear email config
      delete process.env.EMAIL_USER;

      // Recreate service without email config
      const module: TestingModule = await Test.createTestingModule({
        providers: [EmailService],
      }).compile();

      const serviceWithoutEmail = module.get<EmailService>(EmailService);
      const logSpy = jest.spyOn(serviceWithoutEmail['logger'], 'log');

      await serviceWithoutEmail.sendVerificationEmail('user@example.com', '999999');

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('[MOCK EMAIL]'),
      );
    });
  });
});
