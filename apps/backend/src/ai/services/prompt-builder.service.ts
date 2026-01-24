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

  /**
   * Build the main system prompt for the booking assistant.
   */
  buildSystemPrompt(tenant: TenantContext, customer: CustomerInfo): string {
    const servicesText = this.formatServices(tenant.services);
    const hasOperatingHours = this.hasOperatingHours(tenant);
    const noHoursRules = this.buildNoOperatingHoursRules(hasOperatingHours);
    const miniCalendar = this.buildMiniCalendar(tenant);
    const nowObj = this.getNow();
    const now = `${this.formatISODate(nowObj)} ${nowObj
      .getHours()
      .toString()
      .padStart(2, '0')}:${nowObj.getMinutes().toString().padStart(2, '0')}`;

    return `# PERSONA & OBJECTIVE
Você é o agendador inteligente do salão "${tenant.tenantName}". Seu objetivo é agendar horários de forma eficiente e amigável. Cliente: ${customer.name}.

# DYNAMIC CONTEXT (TRUTH)
Data e Hora Atual: ${now}
Serviços Disponíveis:
${servicesText}

Próximos 7 Dias:
${miniCalendar}

${noHoursRules}

# TOOL USE PROTOCOL (STRICT)
1. **Ação Direta:** Quando você precisar de dados (disponibilidade, preços), GERE A CHAMADA DE FERRAMENTA IMEDIATAMENTE.
2. **Silêncio:** NÃO escreva "Vou verificar", "Só um momento" ou "Deixe-me ver". Se você chamar uma ferramenta, seu output de texto deve ser VAZIO.
3. **Recusa:** Se o estabelecimento estiver fechado (baseado no Contexto Dinâmico), recuse educadamente sem chamar ferramentas.

# RESPONSE RULES
- SE Chamada de Ferramenta necessária -> Emita APENAS o objeto da chamada de função.
- SE Resultado da Ferramenta recebido -> Analise-o e envie a resposta final em linguagem natural para o usuário.
- SE Nenhuma ferramenta necessária -> Converse normalmente.

# REASONING PROCESS (INTERNAL - DO NOT OUTPUT)
**Antes de responder, analise silenciosamente:**
1. O cliente mencionou qual dia? (Use o CALENDÁRIO para achar a data YYYY-MM-DD)
2. Consultando o CALENDÁRIO, qual é a DATA exata?
3. Nesta data, o salão está aberto?
4. O horário está dentro do expediente?
5. Decisão: agendar, checar disponibilidade ou sugerir alternativa?

# TONE
Profissional, Português Brasileiro, conciso (estilo WhatsApp). Sem monólogos internos ou tags XML visíveis para o usuário.`;
  }

  /**
   * Build a mini-calendar with the next 7 days and their operating status.
   * This provides explicit date context to avoid LLM date calculation errors.
   */
  private buildMiniCalendar(tenant: TenantContext): string {
    const now = this.getNow();
    const dayNamesShort: Record<number, string> = {
      0: 'DOMINGO',
      1: 'SEGUNDA-FEIRA',
      2: 'TERÇA-FEIRA',
      3: 'QUARTA-FEIRA',
      4: 'QUINTA-FEIRA',
      5: 'SEXTA-FEIRA',
      6: 'SÁBADO',
    };

    const englishDayNames: Record<number, string> = {
      0: 'SUNDAY',
      1: 'MONDAY',
      2: 'TUESDAY',
      3: 'WEDNESDAY',
      4: 'THURSDAY',
      5: 'FRIDAY',
      6: 'SATURDAY',
    };

    const rows: string[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() + i);

      const isoDate = this.formatISODate(date);
      const dayOfWeek = date.getDay();
      const dayName = dayNamesShort[dayOfWeek];
      const isToday = i === 0;

      // Get operating hours for this day
      const englishDay = englishDayNames[dayOfWeek];
      const operatingStatus = this.getOperatingStatusForDay(tenant, englishDay);

      const todayMarker = isToday ? ' ← HOJE' : '';
      rows.push(
        `| ${isoDate} | ${dayName}${todayMarker} | ${operatingStatus} |`,
      );
    }

    return `## 📅 CALENDÁRIO DOS PRÓXIMOS 7 DIAS
**Use esta tabela para identificar datas. NÃO calcule datas mentalmente.**

| Data       | Dia da Semana      | Funcionamento |
|------------|--------------------|---------------|
${rows.join('\n')}

**Como usar**: Quando o cliente disser "segunda", encontre SEGUNDA-FEIRA na tabela e use a data correspondente.`;
  }

  /**
   * Get the operating status text for a specific day.
   */
  private getOperatingStatusForDay(
    tenant: TenantContext,
    englishDayName: string,
  ): string {
    const operatingHour = tenant.operatingHours.find(
      (oh) => oh.day === englishDayName,
    );

    if (!operatingHour) {
      return 'Não definido';
    }

    if (operatingHour.isClosed) {
      return 'FECHADO';
    }

    return `${operatingHour.startTime}-${operatingHour.endTime}`;
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
   * Format a date as YYYY-MM-DD (São Paulo timezone).
   */
  formatISODate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  /**
   * Check if the tenant has any operating hours configured.
   */
  private hasOperatingHours(tenant: TenantContext): boolean {
    return (
      tenant.operatingHours.length > 0 &&
      tenant.operatingHours.some((oh) => !oh.isClosed)
    );
  }

  /**
   * Build additional rules when operating hours are not configured.
   */
  private buildNoOperatingHoursRules(hasOperatingHours: boolean): string {
    if (hasOperatingHours) {
      return '';
    }

    return `

> ⚠️ **ATENÇÃO**: Este estabelecimento NÃO possui horários de funcionamento configurados.
> Quando o cliente perguntar sobre dias/horários de atendimento ou tentar agendar:
> 1. Informe que o salão ainda não definiu os horários de atendimento
> 2. Peça desculpas pela inconveniência
> 3. Sugira que o cliente entre em contato novamente em breve
> 4. NÃO invente horários ou dias de funcionamento
> 5. NÃO tente realizar agendamentos`;
  }
}
