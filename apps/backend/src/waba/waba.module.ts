import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    BullModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'waba-messages',
    }),
  ],
  providers: [WabaProcessor, MessageRouterService, MessageFormatterService],
  controllers: [WabaController],
})
export class WabaModule {}
