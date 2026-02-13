import { Module, OnModuleInit } from '@nestjs/common';
import { GeminiProvider } from './providers/gemini.provider';
import { ConversationService } from './services/conversation.service';
import { PromptBuilderService } from './services/prompt-builder.service';
import { LLMOrchestratorService } from './services/llm-orchestrator.service';
import { ToolCoordinatorService } from './services/tool-coordinator.service';
import { AIAnalyticsService } from './services/ai-analytics.service';
import { CheckAvailabilityTool } from './tools/availability.tool';
import { ListServicesTool } from './tools/services.tool';
import { BookAppointmentTool } from './tools/booking.tool';
import { UpdateCustomerEmailTool } from './tools/update-customer-email.tool';
import { GeneratePaymentLinkTool } from './tools/generate-payment-link.tool';
import { PrismaModule } from '../prisma/prisma.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PrismaModule, PaymentsModule],
  providers: [
    GeminiProvider,
    ConversationService,
    PromptBuilderService,
    LLMOrchestratorService,
    ToolCoordinatorService,
    AIAnalyticsService,
    // AI Tools
    CheckAvailabilityTool,
    ListServicesTool,
    BookAppointmentTool,
    UpdateCustomerEmailTool,
    GeneratePaymentLinkTool,
  ],
  exports: [LLMOrchestratorService, ConversationService, AIAnalyticsService],
})
export class AIModule implements OnModuleInit {
  constructor(
    private readonly toolCoordinator: ToolCoordinatorService,
    private readonly checkAvailabilityTool: CheckAvailabilityTool,
    private readonly listServicesTool: ListServicesTool,
    private readonly bookAppointmentTool: BookAppointmentTool,
    private readonly updateCustomerEmailTool: UpdateCustomerEmailTool,
    private readonly generatePaymentLinkTool: GeneratePaymentLinkTool,
  ) {}

  onModuleInit() {
    // Register all tools with the coordinator
    this.toolCoordinator.registerTool(this.checkAvailabilityTool);
    this.toolCoordinator.registerTool(this.listServicesTool);
    this.toolCoordinator.registerTool(this.bookAppointmentTool);
    this.toolCoordinator.registerTool(this.updateCustomerEmailTool);
    this.toolCoordinator.registerTool(this.generatePaymentLinkTool);
  }
}
