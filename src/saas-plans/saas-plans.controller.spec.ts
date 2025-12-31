import { Test, TestingModule } from '@nestjs/testing';
import { SaasPlansController } from './saas-plans.controller';
import { SaasPlansService } from './saas-plans.service';
import { Prisma } from '../../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';

describe('SaasPlansController', () => {
  let controller: SaasPlansController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SaasPlansController],
      providers: [SaasPlansService, PrismaService],
    }).compile();

    controller = module.get<SaasPlansController>(SaasPlansController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
