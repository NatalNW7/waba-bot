import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createCustomerDto: CreateCustomerDto) {
    const { phone, email, name } = createCustomerDto;

    return this.prisma.$transaction(async (tx) => {
      let customer = await tx.customer.findUnique({
        where: { phone },
      });

      if (!customer) {
        customer = await tx.customer.create({
          data: { phone, email, name },
        });
      }

      // Link to tenant if provided (it should be required technically based on new logic)
      if (tenantId) {
        const link = await tx.tenantCustomer.findUnique({
          where: {
            tenantId_customerId: {
              tenantId,
              customerId: customer.id,
            },
          },
        });

        if (!link) {
          await tx.tenantCustomer.create({
            data: {
              tenantId,
              customerId: customer.id,
            },
          });
        }
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
