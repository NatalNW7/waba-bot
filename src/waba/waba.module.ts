import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { WabaController } from './waba.controller';
import { WabaProcessor } from './waba.processor';

@Module({
    imports: [
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
    providers: [WabaProcessor],
    controllers: [WabaController],
})
export class WabaModule {}
