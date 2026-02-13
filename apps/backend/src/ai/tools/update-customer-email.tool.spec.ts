import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCustomerEmailTool } from './update-customer-email.tool';
import { PrismaService } from '../../prisma/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

describe('UpdateCustomerEmailTool', () => {
  let tool: UpdateCustomerEmailTool;
  let prisma: DeepMockProxy<PrismaService>;

  const mockContext = {
    tenantId: 'tenant-123',
    customerId: 'customer-123',
  };

  const mockCustomer = {
    id: 'customer-123',
    phone: '5511999999999',
    name: 'João',
    email: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = mockDeep<PrismaService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCustomerEmailTool,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    tool = module.get<UpdateCustomerEmailTool>(UpdateCustomerEmailTool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDefinition', () => {
    it('should return correct tool definition', () => {
      const definition = tool.getDefinition();

      expect(definition.name).toBe('update_customer_email');
      expect(definition.description).toContain('email');
      expect(definition.parameters.required).toContain('email');
    });
  });

  describe('execute', () => {
    it('should update customer email successfully', async () => {
      prisma.customer.findUnique.mockResolvedValue(mockCustomer as any);
      prisma.customer.findFirst.mockResolvedValue(null);
      prisma.customer.update.mockResolvedValue({
        ...mockCustomer,
        email: 'joao@email.com',
      } as any);

      const result = await tool.execute(
        { email: 'joao@email.com' },
        mockContext,
      );

      expect(result.success).toBe(true);
      expect(result.data?.email).toBe('joao@email.com');
      expect(result.data?.message).toContain('✅');
      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: 'customer-123' },
        data: { email: 'joao@email.com' },
      });
    });

    it('should reject empty email', async () => {
      const result = await tool.execute({ email: '' }, mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toContain('obrigatório');
    });

    it('should reject invalid email format', async () => {
      const result = await tool.execute(
        { email: 'invalid-email' },
        mockContext,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('inválido');
    });

    it('should reject if customer not found', async () => {
      prisma.customer.findUnique.mockResolvedValue(null);

      const result = await tool.execute(
        { email: 'joao@email.com' },
        mockContext,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('não encontrado');
    });

    it('should reject if email already in use by another customer', async () => {
      prisma.customer.findUnique.mockResolvedValue(mockCustomer as any);
      prisma.customer.findFirst.mockResolvedValue({
        id: 'other-customer',
        email: 'joao@email.com',
      } as any);

      const result = await tool.execute(
        { email: 'joao@email.com' },
        mockContext,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('já está em uso');
    });

    it('should normalize email to lowercase', async () => {
      prisma.customer.findUnique.mockResolvedValue(mockCustomer as any);
      prisma.customer.findFirst.mockResolvedValue(null);
      prisma.customer.update.mockResolvedValue({
        ...mockCustomer,
        email: 'joao@email.com',
      } as any);

      await tool.execute({ email: 'JOAO@Email.COM' }, mockContext);

      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: 'customer-123' },
        data: { email: 'joao@email.com' },
      });
    });

    it('should handle database errors', async () => {
      prisma.customer.findUnique.mockResolvedValue(mockCustomer as any);
      prisma.customer.findFirst.mockResolvedValue(null);
      prisma.customer.update.mockRejectedValue(new Error('Database error'));

      const result = await tool.execute(
        { email: 'joao@email.com' },
        mockContext,
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Database error');
    });
  });
});
