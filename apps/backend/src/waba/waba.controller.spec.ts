import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { WabaController } from './waba.controller';

describe('WabaController', () => {
  let controller: WabaController;

  const mockQueue = {
    add: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-verify-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WabaController],
      providers: [
        {
          provide: getQueueToken('waba-messages'),
          useValue: mockQueue,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<WabaController>(WabaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
