import { Injectable } from '@nestjs/common';
import {
  TenantContext,
  ServiceInfo,
  CustomerInfo,
} from '../interfaces/conversation.interface';

/**
 * Builds system prompts for the AI assistant based on tenant context.
 */
@Injectable()
export class PromptBuilderService {
  private readonly timezone = 'America/Sao_Paulo';

  private readonly monthNames = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];

  /**
   * Build the main system prompt for the booking assistant.
   */
  buildSystemPrompt(tenant: TenantContext, customer: CustomerInfo): string {
    const servicesText = this.formatServices(tenant.services);
    const hoursText = this.formatOperatingHours(tenant);
    const dateContext = this.buildDateContext();

    return `Você é o assistente virtual do salão "${tenant.tenantName}". 
Seu objetivo é ajudar clientes a agendar serviços de forma simpática e eficiente.

${dateContext}

O cliente se chama ${customer.name}.

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
   - email
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

  /**
   * Build comprehensive date/time context for the AI.
   */
  private buildDateContext(): string {
    const now = this.getNow();

    return `## Data e Hora Atual
Hoje é **${this.formatFullDate(now)}** (${this.getCurrentDayName()}) às **${this.formatTime(now)}**.

## Conversão de Datas
Quando o cliente mencionar datas relativas, você DEVE converter para o formato YYYY-MM-DD:
- "hoje" = ${this.formatISODate(now)}
- "amanhã" = ${this.getTomorrow()}
- "próxima segunda" / "segunda que vem" = ${this.getNextWeekday('MONDAY')}
- "próxima terça" = ${this.getNextWeekday('TUESDAY')}
- "próxima quarta" = ${this.getNextWeekday('WEDNESDAY')}
- "próxima quinta" = ${this.getNextWeekday('THURSDAY')}
- "próxima sexta" = ${this.getNextWeekday('FRIDAY')}
- "próximo sábado" = ${this.getNextWeekday('SATURDAY')}
- "próximo domingo" = ${this.getNextWeekday('SUNDAY')}

## Raciocínio Antes de Agendar
Antes de chamar qualquer ferramenta de agendamento, SEMPRE pense:

1. **Data atual**: Hoje é qual dia? (${this.getCurrentDayName()}, ${this.formatFullDate(now)})
2. **Pedido do cliente**: Qual data/horário ele quer?
3. **Cálculo da data**: Converter o pedido para formato YYYY-MM-DD usando a tabela acima
4. **Validação**: A data é futura? Está dentro do expediente?
5. **Ação**: Chamar \`check_availability\` com a data calculada
6. **Se ocupado**: Sugerir 2-3 horários alternativos do mesmo dia ou próximo dia útil

IMPORTANTE: Nunca assuma o dia da semana. Sempre calcule baseado na data de HOJE (${this.formatISODate(now)}).`;
  }

  /**
   * Get current date/time in São Paulo timezone.
   */
  private getNow(): Date {
    // Create a date string in São Paulo timezone, then parse it back
    const saoPauloTime = new Date().toLocaleString('en-US', {
      timeZone: this.timezone,
    });
    return new Date(saoPauloTime);
  }

  /**
   * Format a date as "24 de janeiro de 2026".
   */
  formatFullDate(date: Date = this.getNow()): string {
    const day = date.getDate();
    const month = this.monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
  }

  /**
   * Get the current day name in Portuguese (São Paulo timezone).
   */
  getCurrentDayName(): string {
    const days = [
      'domingo',
      'segunda-feira',
      'terça-feira',
      'quarta-feira',
      'quinta-feira',
      'sexta-feira',
      'sábado',
    ];
    return days[this.getNow().getDay()];
  }

  /**
   * Format a date as HH:mm (São Paulo timezone).
   */
  formatTime(date: Date = this.getNow()): string {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: this.timezone,
    });
  }

  /**
   * Format a date as YYYY-MM-DD (São Paulo timezone).
   */
  formatISODate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get tomorrow's date in YYYY-MM-DD format (São Paulo timezone).
   */
  getTomorrow(): string {
    const tomorrow = this.getNow();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.formatISODate(tomorrow);
  }

  /**
   * Get the next occurrence of a given weekday in YYYY-MM-DD format (São Paulo timezone).
   * @param dayName - Day name in English uppercase (e.g., 'MONDAY')
   */
  getNextWeekday(dayName: string): string {
    const dayMap: Record<string, number> = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    const targetDay = dayMap[dayName];
    if (targetDay === undefined) {
      return 'data inválida';
    }

    const today = this.getNow();
    const currentDay = today.getDay();

    // Calculate days until target day
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) {
      // If target day is today or has passed, go to next week
      daysUntil += 7;
    }

    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    return this.formatISODate(nextDate);
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
