import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { DayOfWeek } from '@prisma/client';
import { OperatingHoursService } from './operating-hours.service';
import { PrismaService } from '../prisma/prisma.service';
import { TenantAuthorizationService } from '../common';
import type { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

describe('OperatingHoursService', () => {
  let service: OperatingHoursService;
  let prisma: PrismaService;

  const mockUser: AuthenticatedUser = {
    sub: 'user-1',
    email: 'test@example.com',
    role: 'TENANT',
    tenantId: 'tenant-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OperatingHoursService,
        {
          provide: PrismaService,
          useValue: {
            operatingHour: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: TenantAuthorizationService,
          useValue: {
            resolveTenantId: jest.fn().mockReturnValue('tenant-1'),
          },
        },
      ],
    }).compile();

    service = module.get<OperatingHoursService>(OperatingHoursService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const validDto = {
      day: DayOfWeek.MONDAY,
      startTime: '08:00',
      endTime: '18:00',
      isClosed: false,
      onlyForSubscribers: false,
    };

    it('should create a valid operating hour', async () => {
      const createdHour = { id: 'oh-1', tenantId: 'tenant-1', ...validDto };

      (prisma.operatingHour.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.operatingHour.create as jest.Mock).mockResolvedValue(createdHour);

      const result = await service.create(validDto, mockUser);

      expect(prisma.operatingHour.create).toHaveBeenCalledWith({
        data: { ...validDto, tenantId: 'tenant-1' },
      });
      expect(result).toEqual(createdHour);
    });

    it('should throw BadRequestException when endTime is before startTime', async () => {
      const invalidDto = {
        ...validDto,
        startTime: '18:00',
        endTime: '08:00',
      };

      await expect(service.create(invalidDto, mockUser)).rejects.toThrow(
        new BadRequestException(
          'O horário de fechamento deve ser posterior ao horário de abertura',
        ),
      );
    });

    it('should throw BadRequestException when endTime equals startTime', async () => {
      const invalidDto = {
        ...validDto,
        startTime: '09:00',
        endTime: '09:00',
      };

      await expect(service.create(invalidDto, mockUser)).rejects.toThrow(
        new BadRequestException(
          'O horário de fechamento deve ser posterior ao horário de abertura',
        ),
      );
    });

    it('should throw ConflictException for overlapping hours on the same day', async () => {
      const existingHour = {
        id: 'oh-existing',
        day: DayOfWeek.MONDAY,
        startTime: '08:00',
        endTime: '18:00',
        tenantId: 'tenant-1',
      };

      (prisma.operatingHour.findMany as jest.Mock).mockResolvedValue([
        existingHour,
      ]);

      const overlappingDto = {
        ...validDto,
        startTime: '09:00',
        endTime: '17:00',
      };

      await expect(service.create(overlappingDto, mockUser)).rejects.toThrow(
        new ConflictException(
          'Já existe um horário de funcionamento que conflita com este período',
        ),
      );
    });

    it('should throw ConflictException when new hours overlap at the start', async () => {
      const existingHour = {
        id: 'oh-existing',
        day: DayOfWeek.MONDAY,
        startTime: '08:00',
        endTime: '12:00',
        tenantId: 'tenant-1',
      };

      (prisma.operatingHour.findMany as jest.Mock).mockResolvedValue([
        existingHour,
      ]);

      const overlappingDto = {
        ...validDto,
        startTime: '10:00',
        endTime: '14:00',
      };

      await expect(service.create(overlappingDto, mockUser)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should allow adjacent (non-overlapping) hours on the same day', async () => {
      const existingHour = {
        id: 'oh-existing',
        day: DayOfWeek.MONDAY,
        startTime: '08:00',
        endTime: '12:00',
        tenantId: 'tenant-1',
      };

      (prisma.operatingHour.findMany as jest.Mock).mockResolvedValue([
        existingHour,
      ]);

      const adjacentDto = {
        ...validDto,
        startTime: '12:00',
        endTime: '18:00',
        onlyForSubscribers: true,
      };

      const createdHour = { id: 'oh-2', tenantId: 'tenant-1', ...adjacentDto };
      (prisma.operatingHour.create as jest.Mock).mockResolvedValue(createdHour);

      const result = await service.create(adjacentDto, mockUser);

      expect(result).toEqual(createdHour);
    });

    it('should allow hours on different days', async () => {
      const existingHour = {
        id: 'oh-existing',
        day: DayOfWeek.MONDAY,
        startTime: '08:00',
        endTime: '18:00',
        tenantId: 'tenant-1',
      };

      // Returns existing for MONDAY, but we're creating for TUESDAY
      (prisma.operatingHour.findMany as jest.Mock).mockResolvedValue([]);

      const tuesdayDto = {
        ...validDto,
        day: DayOfWeek.TUESDAY,
      };

      const createdHour = { id: 'oh-2', tenantId: 'tenant-1', ...tuesdayDto };
      (prisma.operatingHour.create as jest.Mock).mockResolvedValue(createdHour);

      const result = await service.create(tuesdayDto, mockUser);

      expect(result).toEqual(createdHour);
    });
  });

  describe('update', () => {
    const existingHour = {
      id: 'oh-1',
      day: DayOfWeek.MONDAY,
      startTime: '08:00',
      endTime: '18:00',
      isClosed: false,
      onlyForSubscribers: false,
      tenantId: 'tenant-1',
    };

    it('should update a valid operating hour', async () => {
      const updateDto = { startTime: '09:00', endTime: '17:00' };
      const updatedHour = { ...existingHour, ...updateDto };

      (prisma.operatingHour.findUnique as jest.Mock).mockResolvedValue(
        existingHour,
      );
      (prisma.operatingHour.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.operatingHour.update as jest.Mock).mockResolvedValue(updatedHour);

      const result = await service.update('oh-1', updateDto);

      expect(prisma.operatingHour.update).toHaveBeenCalledWith({
        where: { id: 'oh-1' },
        data: updateDto,
      });
      expect(result).toEqual(updatedHour);
    });

    it('should throw NotFoundException when operating hour does not exist', async () => {
      (prisma.operatingHour.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        service.update('non-existent', { startTime: '09:00' }),
      ).rejects.toThrow('Operating Hour with ID non-existent not found');
    });

    it('should throw BadRequestException when updated endTime is before startTime', async () => {
      (prisma.operatingHour.findUnique as jest.Mock).mockResolvedValue(
        existingHour,
      );

      const invalidDto = { startTime: '18:00', endTime: '08:00' };

      await expect(service.update('oh-1', invalidDto)).rejects.toThrow(
        new BadRequestException(
          'O horário de fechamento deve ser posterior ao horário de abertura',
        ),
      );
    });

    it('should throw BadRequestException when partial update makes endTime before startTime', async () => {
      (prisma.operatingHour.findUnique as jest.Mock).mockResolvedValue(
        existingHour,
      );

      // Only updating endTime to before existing startTime
      const invalidDto = { endTime: '07:00' };

      await expect(service.update('oh-1', invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException for overlapping update', async () => {
      const anotherHour = {
        id: 'oh-2',
        day: DayOfWeek.MONDAY,
        startTime: '12:00',
        endTime: '20:00',
        tenantId: 'tenant-1',
      };

      (prisma.operatingHour.findUnique as jest.Mock).mockResolvedValue(
        existingHour,
      );
      (prisma.operatingHour.findMany as jest.Mock).mockResolvedValue([
        anotherHour,
      ]);

      // Try to extend endTime to overlap with anotherHour
      const overlappingDto = { endTime: '15:00' };

      await expect(service.update('oh-1', overlappingDto)).rejects.toThrow(
        new ConflictException(
          'Já existe um horário de funcionamento que conflita com este período',
        ),
      );
    });

    it('should allow update to adjacent (non-overlapping) hours', async () => {
      const anotherHour = {
        id: 'oh-2',
        day: DayOfWeek.MONDAY,
        startTime: '12:00',
        endTime: '20:00',
        tenantId: 'tenant-1',
      };

      (prisma.operatingHour.findUnique as jest.Mock).mockResolvedValue(
        existingHour,
      );
      (prisma.operatingHour.findMany as jest.Mock).mockResolvedValue([
        anotherHour,
      ]);

      // Update endTime to be exactly adjacent (not overlapping)
      const adjacentDto = { endTime: '12:00' };
      const updatedHour = { ...existingHour, ...adjacentDto };

      (prisma.operatingHour.update as jest.Mock).mockResolvedValue(updatedHour);

      const result = await service.update('oh-1', adjacentDto);

      expect(result).toEqual(updatedHour);
    });

    it('should not conflict with itself when updating', async () => {
      (prisma.operatingHour.findUnique as jest.Mock).mockResolvedValue(
        existingHour,
      );
      // findMany excludes the current record (id: { not: id })
      (prisma.operatingHour.findMany as jest.Mock).mockResolvedValue([]);

      const updateDto = { startTime: '09:00' };
      const updatedHour = { ...existingHour, ...updateDto };

      (prisma.operatingHour.update as jest.Mock).mockResolvedValue(updatedHour);

      const result = await service.update('oh-1', updateDto);

      expect(result).toEqual(updatedHour);
    });
  });
});
