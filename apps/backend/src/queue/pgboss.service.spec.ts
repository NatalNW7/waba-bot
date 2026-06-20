import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PgBossService } from './pgboss.service';

jest.mock('pg-boss', () => {
  return jest.fn().mockImplementation(() => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    send: jest.fn().mockResolvedValue('job-id-123'),
    work: jest.fn().mockResolvedValue('worker-id-456'),
  }));
});

describe('PgBossService', () => {
  let service: PgBossService;

  const mockConfigService = {
    get: jest.fn().mockReturnValue('postgresql://localhost:5432/test'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PgBossService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PgBossService>(PgBossService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should start pg-boss', async () => {
      await service.onModuleInit();
      expect(service['boss'].start).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should stop pg-boss gracefully', async () => {
      await service.onModuleDestroy();
      expect(service['boss'].stop).toHaveBeenCalledWith({ graceful: true });
    });
  });

  describe('send', () => {
    it('should send a job to the specified queue', async () => {
      const result = await service.send('test-queue', { key: 'value' });
      expect(result).toBe('job-id-123');
      expect(service['boss'].send).toHaveBeenCalledWith(
        'test-queue',
        { key: 'value' },
        undefined,
      );
    });

    it('should pass options when provided', async () => {
      const options = { retryLimit: 3, retryBackoff: true, retryDelay: 5 };
      await service.send('test-queue', { key: 'value' }, options);
      expect(service['boss'].send).toHaveBeenCalledWith(
        'test-queue',
        { key: 'value' },
        options,
      );
    });
  });

  describe('work', () => {
    it('should register a worker for the specified queue', async () => {
      const handler = jest.fn();
      const result = await service.work('test-queue', handler);
      expect(result).toBe('worker-id-456');
      expect(service['boss'].work).toHaveBeenCalledWith(
        'test-queue',
        handler,
      );
    });
  });
});
