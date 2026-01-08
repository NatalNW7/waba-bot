import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { PrismaService } from '../prisma/prisma.service';
import { parseInclude } from '../common/utils/prisma-include.util';
import { TenantRepository } from './tenant-repository.service';
import { TenantSaasService } from './tenant-saas.service';
import { TenantMpAuthService } from './tenant-mp-auth.service';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: TenantRepository,
    private readonly saasService: TenantSaasService,
    private readonly mpAuthService: TenantMpAuthService,
  ) {}

  async create(createTenantDto: CreateTenantDto) {
    if (createTenantDto.saasPlanId) {
      const plan = await this.prisma.saasPlan.findUnique({
        where: { id: createTenantDto.saasPlanId },
      });

      if (!plan) {
        throw new BadRequestException('this saas plan does not exists');
      }
    }

    return this.repo.create(createTenantDto);
  }

  findAll() {
    return this.repo.findAll();
  }

  async findOne(id: string, include?: string) {
    const includeObj = parseInclude(
      include,
      [
        'saasPlan',
        'calendar',
        'services',
        'appointments',
        'customers',
        'plans',
        'operatingHours',
        'payments',
      ],
      {
        customers: {
          key: 'customerLinks',
          value: { include: { customer: true } },
        },
      },
    );

    const tenant = await this.repo.findUnique({
      where: { id },
      include: includeObj,
    });

    if (!tenant) {
      throw new NotFoundException('The provided tenantId does not exist.');
    }

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

  update(id: string, updateTenantDto: UpdateTenantDto) {
    return this.repo.update(id, updateTenantDto);
  }

  remove(id: string) {
    return this.repo.delete(id);
  }

  async createSubscription(id: string) {
    return this.saasService.createSubscription(id);
  }

  getMpAuthorizationUrl(tenantId: string) {
    return this.mpAuthService.getMpAuthorizationUrl(tenantId);
  }

  async exchangeMpCode(code: string, tenantId: string) {
    return this.mpAuthService.exchangeMpCode(code, tenantId);
  }
}
