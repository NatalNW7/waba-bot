import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { WabaController } from './waba.controller';
import { WabaProcessor } from './waba.processor';
import { MessageRouterService } from './services/message-router.service';
import { MessageFormatterService } from './services/message-formatter.service';
import { AIModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    AIModule,
    RedisModule,
    BullModule.registerQueue({
      name: 'waba-messages',
    }),
  ],
  providers: [WabaProcessor, MessageRouterService, MessageFormatterService],
  controllers: [WabaController],
})
export class WabaModule {}
