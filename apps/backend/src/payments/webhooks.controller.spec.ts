import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { MercadoPagoWebhooksService } from './mercadopago-webhooks.service';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let service: MercadoPagoWebhooksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhooksController],
      providers: [
        {
          provide: MercadoPagoWebhooksService,
          useValue: {
            handleNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
    service = module.get<MercadoPagoWebhooksService>(
      MercadoPagoWebhooksService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleWebhook', () => {
    const mockBody = {
      type: 'payment',
      data: { id: '123456' },
    };

    it('should call service handleNotification if no signature validation is required', async () => {
      process.env.MP_WEBHOOK_SECRET = '';
      await controller.handleWebhook('platform', mockBody, '', '');
      expect(service.handleNotification).toHaveBeenCalledWith(
        'payment',
        '123456',
        'platform',
      );
    });

    it('should throw BadRequestException if signature is invalid', async () => {
      process.env.MP_WEBHOOK_SECRET = 'secret';
      const invalidSignature = 'ts=123,v1=wrong';
      await expect(
        controller.handleWebhook(
          'platform',
          mockBody,
          invalidSignature,
          'req-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should pass validation if signature is correct', async () => {
      const secret = 'test-secret';
      process.env.MP_WEBHOOK_SECRET = secret;
      const ts = '123456789';
      const resourceId = '123';
      const requestId = 'req-abc';

      const manifest = `id:${resourceId};request-id:${requestId};ts:${ts};`;
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(manifest);
      const v1 = hmac.digest('hex');
      const signatureHeader = `ts=${ts},v1=${v1}`;

      await controller.handleWebhook(
        'platform',
        { id: resourceId, topic: 'payment' },
        signatureHeader,
        requestId,
      );

      expect(service.handleNotification).toHaveBeenCalled();
    });
  });
});
