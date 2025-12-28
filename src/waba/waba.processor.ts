import { Process, Processor } from "@nestjs/bull";
import { WebhookPayload } from "./waba.interface";
import WabaAPI from "./waba.api";

@Processor('waba-messages')
export class WabaProcessor {
    @Process('process-message')
    async handleProcessMessage(job: any) {
        const wabaApi = WabaAPI();
        const data: WebhookPayload = job.data;
        
        console.log('Processing message:', data);

        const phonId = data.entry[0].changes[0].value.metadata.phone_number_id;
        const to = data.entry[0].changes[0].value.messages[0].from;
        const message = "Olá, essa é uma mensagem de teste enviada pela API do WhatsApp Business.";
        const response = await wabaApi.sendMessage(phonId, to, message);
        console.log('Message sent response:', response);
    }   
}