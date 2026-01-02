import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    if (createTenantDto.saasPlanId) {
      const plan = await this.prisma.saasPlan.findUnique({
        where: { id: createTenantDto.saasPlanId },
      });

      if (!plan) {
        throw new BadRequestException('this saas plan does not exists');
      }
    }

    return this.prisma.tenant.create({
      data: createTenantDto,
    });
  }

  findAll() {
    return this.prisma.tenant.findMany();
  }

  async findOne(id: string, include?: string) {
    const includeObj = this.parseInclude(include);
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: Object.keys(includeObj).length > 0 ? includeObj : undefined,
    });

    if (!tenant) return null;

    // Se incluiu customerLinks, vamos achatar para "customers" para manter a compatibilidade da API
    if (tenant['customerLinks']) {
      (tenant as any).customers = (tenant as any).customerLinks.map(
        (link: any) => ({
          ...link.customer,
          offerNotification: link.offerNotification,
          mpCustomerId: link.mpCustomerId,
          tenantId: link.tenantId,
        }),
      );
      delete (tenant as any).customerLinks;
    }

    return tenant;
  }

  private parseInclude(includeStr?: string) {
    const includeObj: any = {};
    if (!includeStr) return includeObj;

    const validRelations = [
      'saasPlan',
      'calendar',
      'services',
      'appointments',
      'customers',
      'plans',
      'operatingHours',
      'payments',
    ];

    const requestedRelations = includeStr.split(',').map((r) => r.trim());

    requestedRelations.forEach((rel) => {
      if (validRelations.includes(rel)) {
        if (rel === 'customers') {
          includeObj['customerLinks'] = {
            include: {
              customer: true,
            },
          };
        } else {
          includeObj[rel] = true;
        }
      }
    });

    return includeObj;
  }

  update(id: string, updateTenantDto: UpdateTenantDto) {
    return this.prisma.tenant.update({
      where: { id },
      data: updateTenantDto,
    });
  }

  remove(id: string) {
    return this.prisma.tenant.delete({
      where: { id },
    });
  }
}
