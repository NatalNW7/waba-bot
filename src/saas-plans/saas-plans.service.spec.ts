import { Test, TestingModule } from '@nestjs/testing';
import { SaasPlansService } from './saas-plans.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SaasPlansService', () => {
  let service: SaasPlansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SaasPlansService, PrismaService],
    }).compile();

    service = module.get<SaasPlansService>(SaasPlansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
