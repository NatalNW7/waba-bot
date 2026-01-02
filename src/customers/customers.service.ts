import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    tenantId: string | undefined,
    createCustomerDto: CreateCustomerDto,
  ) {
    const { phone, email, name } = createCustomerDto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Check if customer already exists by phone or email
      const existing = await tx.customer.findFirst({
        where: {
          OR: [{ phone }, ...(email ? [{ email }] : [])],
        },
      });

      if (existing) {
        if (existing.phone === phone) {
          throw new BadRequestException(
            `A customer with phone ${phone} already exists.`,
          );
        }
        if (email && existing.email === email) {
          throw new BadRequestException(
            `A customer with email ${email} already exists.`,
          );
        }
      }

      // 2. Create new customer
      const customer = await tx.customer.create({
        data: { phone, email, name },
      });

      // 3. Link to tenant if provided
      if (tenantId) {
        // Since it's a new customer, we don't strictly need to check for existing link,
        // but it's safer to keep the transaction logic robust.
        await tx.tenantCustomer.create({
          data: {
            tenantId,
            customerId: customer.id,
          },
        });
      }

      return customer;
    });
  }

  findAll() {
    return this.prisma.customer.findMany();
  }

  findOne(id: string) {
    return this.prisma.customer.findUnique({
      where: { id },
    });
  }

  update(id: string, updateCustomerDto: UpdateCustomerDto) {
    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  remove(id: string) {
    return this.prisma.customer.delete({
      where: { id },
    });
  }
}
