import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';

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

      // Mock customer findUnique (not found)
      (prisma as any).customer.findUnique = jest.fn().mockResolvedValue(null);
      // Mock customer create
      const createdCustomer = { id: 'cust-1', ...createCustomerDto };
      (prisma as any).customer.create = jest
        .fn()
        .mockResolvedValue(createdCustomer);

      // Mock tenantCustomer findUnique (not found)
      (prisma as any).tenantCustomer.findUnique = jest
        .fn()
        .mockResolvedValue(null);
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

    it('should use existing customer and link to tenant', async () => {
      // Mock transaction
      (prisma as any).$transaction = jest
        .fn()
        .mockImplementation((cb) => cb(prisma));

      const existingCustomer = { id: 'cust-1', ...createCustomerDto };
      // Mock customer findUnique (found)
      (prisma as any).customer.findUnique = jest
        .fn()
        .mockResolvedValue(existingCustomer);
      (prisma as any).customer.create = jest.fn(); // Should not be called

      // Mock tenantCustomer findUnique (not found)
      (prisma as any).tenantCustomer.findUnique = jest
        .fn()
        .mockResolvedValue(null);
      (prisma as any).tenantCustomer.create = jest.fn().mockResolvedValue({
        id: 'link-1',
        tenantId,
        customerId: existingCustomer.id,
      });

      const result = await service.create(tenantId, createCustomerDto);

      expect((prisma as any).customer.create).not.toHaveBeenCalled();
      expect((prisma as any).tenantCustomer.create).toHaveBeenCalledWith({
        data: {
          tenantId,
          customerId: existingCustomer.id,
        },
      });
      expect(result).toEqual(existingCustomer);
    });

    it('should not create link if already linked', async () => {
      // Mock transaction
      (prisma as any).$transaction = jest
        .fn()
        .mockImplementation((cb) => cb(prisma));

      const existingCustomer = { id: 'cust-1', ...createCustomerDto };
      // Mock customer findUnique (found)
      (prisma as any).customer.findUnique = jest
        .fn()
        .mockResolvedValue(existingCustomer);

      // Mock tenantCustomer findUnique (found)
      (prisma as any).tenantCustomer.findUnique = jest.fn().mockResolvedValue({
        id: 'link-1',
        tenantId,
        customerId: existingCustomer.id,
      });
      (prisma as any).tenantCustomer.create = jest.fn();

      await service.create(tenantId, createCustomerDto);

      expect((prisma as any).tenantCustomer.create).not.toHaveBeenCalled();
    });
  });
});
