import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { WabaController } from './waba.controller';
import { WabaProcessor } from './waba.processor';
import { MessageRouterService } from './services/message-router.service';
import { MessageFormatterService } from './services/message-formatter.service';
import { AIModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    AIModule,
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    }),
    BullModule.registerQueue({
      name: 'waba-messages',
    }),
  ],
  providers: [WabaProcessor, MessageRouterService, MessageFormatterService],
  controllers: [WabaController],
})
export class WabaModule {}
