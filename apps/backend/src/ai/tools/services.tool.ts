import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ITool,
  ToolExecutionContext,
  ToolExecutionResult,
  ToolName,
} from '../interfaces/tool.interface';
import { Tool } from '../interfaces/llm-provider.interface';

/**
 * Tool for listing available services for a tenant.
 */
@Injectable()
export class ListServicesTool implements ITool {
  readonly name: ToolName = 'list_services';

  constructor(private readonly prisma: PrismaService) {}

  getDefinition(): Tool {
    return {
      name: this.name,
      description:
        'Lista todos os serviços disponíveis no salão com seus preços e durações. Use quando o cliente perguntar sobre serviços, preços ou o que está disponível.',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    };
  }

  async execute(
    _args: Record<string, unknown>,
    context: ToolExecutionContext,
  ): Promise<ToolExecutionResult> {
    try {
      const services = await this.prisma.service.findMany({
        where: {
          tenantId: context.tenantId,
        },
        orderBy: {
          name: 'asc',
        },
      });

      if (services.length === 0) {
        return {
          success: true,
          data: {
            services: [],
            message: 'Nenhum serviço cadastrado ainda.',
          },
        };
      }

      const formattedServices = services.map((s) => ({
        id: s.id,
        name: s.name,
        price: `R$ ${Number(s.price).toFixed(2)}`,
        priceValue: Number(s.price),
        duration: `${s.duration} minutos`,
        durationMinutes: s.duration,
      }));

      return {
        success: true,
        data: {
          services: formattedServices,
          count: services.length,
          message: `Temos ${services.length} serviço(s) disponível(is).`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Erro ao listar serviços',
      };
    }
  }
}
