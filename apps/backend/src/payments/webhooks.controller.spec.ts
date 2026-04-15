import { Test, TestingModule } from '@nestjs/testing';
import { WebhooksController } from './webhooks.controller';
import { MercadoPagoWebhooksService } from './mercadopago-webhooks.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';

describe('WebhooksController', () => {
  let controller: WebhooksController;
  let service: MercadoPagoWebhooksService;
  let configService: ConfigService;

  const mockRequest = (queryOverrides: Record<string, string> = {}) =>
    ({ query: { ...queryOverrides } }) as any;

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
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WebhooksController>(WebhooksController);
    service = module.get<MercadoPagoWebhooksService>(
      MercadoPagoWebhooksService,
    );
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleWebhook', () => {
    it('should resolve targetId as platform when user_id matches token', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'MP_PLATFORM_ACCESS_TOKEN')
          return 'APP_USR-123-456-abc-257942709';
        return undefined;
      });

      const body = {
        type: 'payment',
        data: { id: '123456' },
        user_id: '257942709',
      };

      await controller.handleWebhook(mockRequest(), body, '', '');
      expect(service.handleNotification).toHaveBeenCalledWith(
        'payment',
        '123456',
        'platform',
      );
    });

    it('should extract data.id from query params when available', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      const body = { type: 'payment', data: { id: '999' } };
      const req = mockRequest({ 'data.id': '123' });

      await controller.handleWebhook(req, body, '', '', 'payment');
      expect(service.handleNotification).toHaveBeenCalledWith(
        'payment',
        '123',
        'platform',
      );
    });

    it('should fall back to body.data.id when no query param', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      const body = { type: 'payment', data: { id: '789' } };
      await controller.handleWebhook(mockRequest(), body, '', '');
      expect(service.handleNotification).toHaveBeenCalledWith(
        'payment',
        '789',
        'platform',
      );
    });

    it('should throw BadRequestException if signature is invalid', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'MP_WEBHOOK_SECRET') return 'secret';
        return undefined;
      });

      const body = { type: 'payment', data: { id: '123' } };
      await expect(
        controller.handleWebhook(
          mockRequest(),
          body,
          'ts=123,v1=wrong',
          'req-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should pass validation if signature is correct', async () => {
      const secret = 'test-secret';
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'MP_WEBHOOK_SECRET') return secret;
        return undefined;
      });

      const ts = '123456789';
      const dataId = '123';
      const requestId = 'req-abc';

      const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
      const hmac = crypto.createHmac('sha256', secret);
      hmac.update(manifest);
      const v1 = hmac.digest('hex');
      const signatureHeader = `ts=${ts},v1=${v1}`;

      const req = mockRequest({ 'data.id': dataId });
      await controller.handleWebhook(
        req,
        { topic: 'payment' },
        signatureHeader,
        requestId,
      );

      expect(service.handleNotification).toHaveBeenCalled();
    });

    it('should skip signature validation when no x-signature header', async () => {
      jest.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'MP_WEBHOOK_SECRET') return 'secret';
        return undefined;
      });

      const body = { type: 'payment', data: { id: '456' } };
      await controller.handleWebhook(mockRequest(), body, '', '');
      expect(service.handleNotification).toHaveBeenCalledWith(
        'payment',
        '456',
        'platform',
      );
    });
  });
});
