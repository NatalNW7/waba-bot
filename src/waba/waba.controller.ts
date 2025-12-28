import { InjectQueue } from '@nestjs/bull';
import { Body, Controller, Post } from '@nestjs/common';
import type { Queue } from 'bull';

@Controller('webhook/whatsapp')
export class WabaController {
    constructor(@InjectQueue('waba-messages') private readonly wabaQueue: Queue) {}

    @Post()
    async hendleMessage(@Body() body: any) {
        await this.wabaQueue.add('process-message', body, {
            removeOnComplete: true,
        });
        return { status: 'Message queued' };
    }
}
