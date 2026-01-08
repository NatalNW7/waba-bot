import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentOperatingHoursValidator } from './appointment-operating-hours.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('AppointmentOperatingHoursValidator', () => {
  let service: AppointmentOperatingHoursValidator;
  let prisma: PrismaService;

  const mockPrisma = {
    operatingHour: { findFirst: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentOperatingHoursValidator,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AppointmentOperatingHoursValidator>(
      AppointmentOperatingHoursValidator,
    );
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should throw when the business is closed', async () => {
    mockPrisma.operatingHour.findFirst.mockResolvedValue({ isClosed: true });
    const date = new Date('2026-01-04T12:00:00Z'); // Sunday

    await expect(
      service.assertWithinOperatingHours('t1', date),
    ).rejects.toThrow(
      new BadRequestException('The business is closed on the chosen date.'),
    );
  });

  it('should throw when outside operating hours', async () => {
    mockPrisma.operatingHour.findFirst.mockResolvedValue({
      isClosed: false,
      startTime: '09:00',
      endTime: '18:00',
    });
    const date = new Date('2026-01-03T20:00:00Z'); // Saturday at 8 PM

    await expect(
      service.assertWithinOperatingHours('t1', date),
    ).rejects.toThrow(
      new BadRequestException('The chosen time is outside of operating hours.'),
    );
  });

  it('should not throw when within operating hours', async () => {
    mockPrisma.operatingHour.findFirst.mockResolvedValue({
      isClosed: false,
      startTime: '09:00',
      endTime: '18:00',
    });
    const date = new Date('2026-01-03T10:00:00Z'); // 10 AM

    await expect(
      service.assertWithinOperatingHours('t1', date),
    ).resolves.not.toThrow();
  });
});
