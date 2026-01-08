import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(),
            customer: {
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
            },
            tenantCustomer: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    const tenantId = 'tenant-1';
    const createCustomerDto = {
      phone: '+1234567890',
      email: 'test@example.com',
      name: 'Test Customer',
    };

    it('should create customer and link to tenant', async () => {
      // Mock transaction
      (prisma as any).$transaction = jest
        .fn()
        .mockImplementation((cb) => cb(prisma));

      // Mock customer findFirst (not found)
      (prisma as any).customer.findFirst = jest.fn().mockResolvedValue(null);
      // Mock customer create
      const createdCustomer = { id: 'cust-1', ...createCustomerDto };
      (prisma as any).customer.create = jest
        .fn()
        .mockResolvedValue(createdCustomer);

      // Mock tenantCustomer create
      (prisma as any).tenantCustomer.create = jest.fn().mockResolvedValue({
        id: 'link-1',
        tenantId,
        customerId: createdCustomer.id,
      });

      const result = await service.create(tenantId, createCustomerDto);

      expect((prisma as any).customer.create).toHaveBeenCalledWith({
        data: createCustomerDto,
      });
      expect((prisma as any).tenantCustomer.create).toHaveBeenCalledWith({
        data: {
          tenantId,
          customerId: createdCustomer.id,
        },
      });
      expect(result).toEqual(createdCustomer);
    });

    it('should throw BadRequestException if customer with same phone exists', async () => {
      // Mock transaction
      (prisma as any).$transaction = jest
        .fn()
        .mockImplementation((cb) => cb(prisma));

      const existingCustomer = { id: 'cust-1', ...createCustomerDto };
      // Mock customer findFirst (found by phone)
      (prisma as any).customer.findFirst = jest
        .fn()
        .mockResolvedValue(existingCustomer);

      await expect(service.create(tenantId, createCustomerDto)).rejects.toThrow(
        new BadRequestException(
          `A customer with phone ${createCustomerDto.phone} already exists.`,
        ),
      );
    });

    it('should throw BadRequestException if customer with same email exists', async () => {
      // Mock transaction
      (prisma as any).$transaction = jest
        .fn()
        .mockImplementation((cb) => cb(prisma));

      const existingCustomer = {
        id: 'cust-2',
        phone: '+9999999999',
        email: createCustomerDto.email,
        name: 'Another',
      };
      // Mock customer findFirst (found by email)
      (prisma as any).customer.findFirst = jest
        .fn()
        .mockResolvedValue(existingCustomer);

      await expect(service.create(tenantId, createCustomerDto)).rejects.toThrow(
        new BadRequestException(
          `A customer with email ${createCustomerDto.email} already exists.`,
        ),
      );
    });

    it('should create customer without tenant link if tenantId is not provided', async () => {
      // Mock transaction
      (prisma as any).$transaction = jest
        .fn()
        .mockImplementation((cb) => cb(prisma));

      const createdCustomer = { id: 'cust-1', ...createCustomerDto };
      (prisma as any).customer.findFirst = jest.fn().mockResolvedValue(null);
      (prisma as any).customer.create = jest
        .fn()
        .mockResolvedValue(createdCustomer);

      (prisma as any).tenantCustomer.create = jest.fn();

      const result = await service.create(undefined, createCustomerDto);

      expect((prisma as any).customer.create).toHaveBeenCalled();
      expect((prisma as any).tenantCustomer.create).not.toHaveBeenCalled();
      expect(result).toEqual(createdCustomer);
    });
  });
});
