import { Injectable } from '@nestjs/common';
import {
  TenantContext,
  ServiceInfo,
} from '../interfaces/conversation.interface';

/**
 * Builds system prompts for the AI assistant based on tenant context.
 */
@Injectable()
export class PromptBuilderService {
  /**
   * Build the main system prompt for the booking assistant.
   */
  buildSystemPrompt(tenant: TenantContext): string {
    const servicesText = this.formatServices(tenant.services);
    const hoursText = this.formatOperatingHours(tenant);

    return `Hoje é dia ${new Date().toLocaleDateString('pt-BR')}.
Você é o assistente virtual do salão "${tenant.tenantName}".
Seu objetivo é ajudar clientes a agendar serviços de forma simpática e eficiente.

## Sua Personalidade
- Seja gentil, profissional e objetivo
- Use linguagem informal mas respeitosa
- Responda sempre em português brasileiro
- Use emojis com moderação para deixar a conversa mais amigável

## Serviços Disponíveis
${servicesText}

## Horário de Funcionamento
${hoursText}

## Regras Importantes
1. Sempre use a ferramenta \`list_services\` quando o cliente perguntar sobre serviços ou preços
2. Use \`check_availability\` para verificar horários disponíveis antes de sugerir
3. Use \`book_appointment\` somente após confirmar TODOS os dados com o cliente:
   - Serviço desejado
   - Data
   - Horário
4. Nunca invente horários ou preços - sempre consulte as ferramentas
5. Se não souber algo, diga que vai verificar ou peça para o cliente entrar em contato diretamente

## Fluxo de Agendamento
1. Cumprimente e pergunte como pode ajudar
2. Identifique o serviço desejado
3. Pergunte a data preferida
4. Verifique disponibilidade e ofereça opções
5. Confirme todos os detalhes antes de agendar
6. Agradeça e deseje um ótimo atendimento

## Respostas Curtas
Mantenha as respostas concisas para WhatsApp. Evite textos muito longos.`;
  }

  private formatServices(services: ServiceInfo[]): string {
    if (services.length === 0) {
      return 'Nenhum serviço cadastrado ainda.';
    }

    return services
      .map(
        (s) => `- **${s.name}**: R$ ${s.price.toFixed(2)} (${s.duration} min)`,
      )
      .join('\n');
  }

  private formatOperatingHours(tenant: TenantContext): string {
    const dayNames: Record<string, string> = {
      MONDAY: 'Segunda',
      TUESDAY: 'Terça',
      WEDNESDAY: 'Quarta',
      THURSDAY: 'Quinta',
      FRIDAY: 'Sexta',
      SATURDAY: 'Sábado',
      SUNDAY: 'Domingo',
    };

    const sortOrder = [
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
      'SUNDAY',
    ];

    const hours = tenant.operatingHours
      .sort((a, b) => sortOrder.indexOf(a.day) - sortOrder.indexOf(b.day))
      .map((oh) => {
        const dayName = dayNames[oh.day] || oh.day;
        if (oh.isClosed) {
          return `- ${dayName}: Fechado`;
        }
        return `- ${dayName}: ${oh.startTime} às ${oh.endTime}`;
      });

    return hours.length > 0 ? hours.join('\n') : 'Horários não configurados.';
  }
}
