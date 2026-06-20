import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WabaController } from './waba.controller';
import { PgBossService } from '../queue/pgboss.service';

describe('WabaController', () => {
  let controller: WabaController;

  const mockPgBoss = {
    send: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-verify-token'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WabaController],
      providers: [
        {
          provide: PgBossService,
          useValue: mockPgBoss,
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
