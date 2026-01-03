import { Test, TestingModule } from '@nestjs/testing';
import {
  SchedulingService,
  DEFAULT_SERVICE_DURATION_MINUTES,
} from './scheduling.service';
import { AppointmentRepository } from './appointment-repository.service';
import { BadRequestException } from '@nestjs/common';

describe('SchedulingService', () => {
  let service: SchedulingService;
  let repo: AppointmentRepository;

  const mockRepo = {
    findDayAppointments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        { provide: AppointmentRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<SchedulingService>(SchedulingService);
    repo = module.get<AppointmentRepository>(AppointmentRepository);
  });

  it('should throw BadRequestException on conflict', async () => {
    const tenantId = 't1';
    const startUtc = new Date('2026-01-03T10:00:00Z');
    const duration = 30;

    mockRepo.findDayAppointments.mockResolvedValue([
      {
        id: 'existing-1',
        date: new Date('2026-01-03T10:15:00Z'),
        service: { duration: 30 },
      },
    ]);

    await expect(
      service.assertNoConflict(tenantId, startUtc, duration),
    ).rejects.toThrow(BadRequestException);
  });

  it('should not throw if no conflict', async () => {
    const tenantId = 't1';
    const startUtc = new Date('2026-01-03T10:00:00Z');
    const duration = 30;

    mockRepo.findDayAppointments.mockResolvedValue([
      {
        id: 'existing-1',
        date: new Date('2026-01-03T11:00:00Z'), // Starts after
        service: { duration: 30 },
      },
      {
        id: 'existing-2',
        date: new Date('2026-01-03T09:00:00Z'), // Ends exactly at start
        service: { duration: 60 },
      },
    ]);

    await expect(
      service.assertNoConflict(tenantId, startUtc, duration),
    ).resolves.not.toThrow();
  });

  it('should exclude the current appointment when updating', async () => {
    const tenantId = 't1';
    const startUtc = new Date('2026-01-03T10:00:00Z');
    const duration = 30;
    const currentId = 'existing-1';

    mockRepo.findDayAppointments.mockResolvedValue([
      {
        id: currentId,
        date: new Date('2026-01-03T10:00:00Z'),
        service: { duration: 30 },
      },
    ]);

    await expect(
      service.assertNoConflict(tenantId, startUtc, duration, currentId),
    ).resolves.not.toThrow();
  });
});
