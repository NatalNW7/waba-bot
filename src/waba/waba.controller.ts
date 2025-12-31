import { InjectQueue } from '@nestjs/bull';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger';
import type { Queue } from 'bull';

@ApiTags('WhatsApp Webhook')
@Controller('webhook/whatsapp')
export class WabaController {
    constructor(@InjectQueue('waba-messages') private readonly wabaQueue: Queue) {}

    /** 
     * Receive and queue WhatsApp messages from Meta Webhook 
     * @param body Webhook payload from Meta
     */
    @Post()
    @ApiOperation({ summary: 'WhatsApp Webhook' })
    @ApiCreatedResponse({ description: 'Message received and queued successfully' })
    async hendleMessage(@Body() body: any) {
        await this.wabaQueue.add('process-message', body, {
            removeOnComplete: true,
        });
        return { status: 'Message queued' };
    }
}
