import { Module } from '@nestjs/common';
import { WabaController } from './waba.controller';
import { WabaProcessor } from './waba.processor';
import { MessageRouterService } from './services/message-router.service';
import { MessageFormatterService } from './services/message-formatter.service';
import { AIModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PgBossModule } from '../queue/pgboss.module';

@Module({
  imports: [PrismaModule, AIModule, PgBossModule],
  providers: [WabaProcessor, MessageRouterService, MessageFormatterService],
  controllers: [WabaController],
})
export class WabaModule {}
