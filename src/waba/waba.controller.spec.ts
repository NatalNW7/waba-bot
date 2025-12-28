import { Test, TestingModule } from '@nestjs/testing';
import { WabaController } from './waba.controller';

describe('WabaController', () => {
  let controller: WabaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WabaController],
    }).compile();

    controller = module.get<WabaController>(WabaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
