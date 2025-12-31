import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import { WabaController } from './waba.controller';

describe('WabaController', () => {
  let controller: WabaController;

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WabaController],
      providers: [
        {
          provide: getQueueToken('waba-messages'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    controller = module.get<WabaController>(WabaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
