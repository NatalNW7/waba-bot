import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PgBoss } from 'pg-boss';
import type { SendOptions, WorkHandler } from 'pg-boss';

@Injectable()
export class PgBossService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PgBossService.name);
  private boss: PgBoss;

  constructor(private readonly config: ConfigService) {
    this.boss = new PgBoss(this.config.get<string>('DATABASE_URL')!);
  }

  async onModuleInit() {
    await this.boss.start();
    this.logger.log('PgBoss started');
  }

  async onModuleDestroy() {
    await this.boss.stop({ graceful: true });
    this.logger.log('PgBoss stopped');
  }

  send<T extends object>(
    queueName: string,
    data: T,
    options?: SendOptions,
  ): Promise<string | null> {
    return this.boss.send(queueName, data, options);
  }

  async work<T extends object>(
    queueName: string,
    handler: WorkHandler<T>,
  ): Promise<string> {
    // Garante que a fila exista antes de iniciar o worker. O pg-boss 12+ exige isso 
    // se nenhum job tiver sido enviado para a fila previamente. É uma operação idempotente.
    await this.boss.createQueue(queueName);
    return this.boss.work(queueName, handler);
  }
}
