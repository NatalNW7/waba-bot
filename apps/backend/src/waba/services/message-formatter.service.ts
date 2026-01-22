import { Injectable } from '@nestjs/common';

/**
 * Formats AI responses for WhatsApp delivery.
 * Handles message length limits and formatting.
 */
@Injectable()
export class MessageFormatterService {
  private readonly MAX_MESSAGE_LENGTH = 4096; // WhatsApp limit

  /**
   * Format an AI response for WhatsApp.
   */
  formatForWhatsApp(text: string): string {
    // Clean up markdown that doesn't render well in WhatsApp
    let formatted = text
      // Convert markdown bold to WhatsApp bold
      .replace(/\*\*(.*?)\*\*/g, '*$1*')
      // Remove markdown links, keep text
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      // Clean up excessive newlines
      .replace(/\n{3,}/g, '\n\n');

    // Truncate if too long
    if (formatted.length > this.MAX_MESSAGE_LENGTH) {
      formatted = formatted.substring(0, this.MAX_MESSAGE_LENGTH - 3) + '...';
    }

    return formatted.trim();
  }

  /**
   * Build a structured list message for services.
   */
  formatServicesList(
    services: Array<{ name: string; price: string; duration: string }>,
  ): string {
    if (services.length === 0) {
      return 'Nenhum serviço cadastrado ainda.';
    }

    const header = '📋 *Nossos Serviços*\n\n';
    const list = services
      .map(
        (s, i) => `${i + 1}. *${s.name}*\n   💰 ${s.price} | ⏱️ ${s.duration}`,
      )
      .join('\n\n');

    return header + list;
  }

  /**
   * Format available time slots.
   */
  formatAvailableSlots(date: string, slots: string[]): string {
    if (slots.length === 0) {
      return `😔 Não há horários disponíveis em ${date}.`;
    }

    const header = `📅 *Horários disponíveis - ${date}*\n\n`;
    const slotList = slots.map((s) => `🕐 ${s}`).join('\n');

    return header + slotList;
  }

  /**
   * Format appointment confirmation.
   */
  formatAppointmentConfirmation(data: {
    service: string;
    date: string;
    time: string;
    price: string;
  }): string {
    return `✅ *Agendamento Confirmado!*

📌 *Serviço:* ${data.service}
📅 *Data:* ${data.date}
🕐 *Horário:* ${data.time}
💰 *Valor:* ${data.price}

Até lá! 💇‍♀️`;
  }

  /**
   * Format error message for user.
   */
  formatErrorMessage(): string {
    return '😔 Desculpe, ocorreu um problema. Por favor, tente novamente em alguns instantes.';
  }
}
