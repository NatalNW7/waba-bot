# Trabalhos Futuros e Débitos Técnicos (TODO)

Esta lista acompanha melhorias e recursos não críticos que devem ser implementados em iterações futuras.

## Notificações

- [ ] **Notificar o tenant sobre pagamento SaaS falho (`PAST_DUE`)**
  - **Contexto**: Quando a assinatura SaaS de um tenant falha (ex: `cc_rejected_high_risk`), o `saasStatus` é alterado para `PAST_DUE`. O Mercado Pago retenta automaticamente algumas vezes (geralmente 3).
  - **Objetivo**: Implementar envio de e-mail e/ou mensagem via WhatsApp para alertar o tenant que o pagamento falhou, evitando que ele perca o acesso ao sistema quando as tentativas se esgotarem e for `CANCELED`.
  - **Prioridade**: Média/Alta (afeta churn e retenção).

## Bugs

- [ ] **`resolveTargetId` sempre retorna `'platform'` como fallback**
  - **Arquivo**: `apps/backend/src/payments/webhooks.controller.ts` (L83–104)
  - **Descrição**: O método `resolveTargetId` compara o `user_id` do webhook apenas com o token da plataforma (`MP_PLATFORM_ACCESS_TOKEN`). Se o `user_id` não bater com o da plataforma, ele faz fallback para `'platform'` ao invés de tentar resolver o tenant correto.
  - **Impacto**: Pagamentos de tenants via OAuth que cheguem pelo webhook da plataforma seriam classificados incorretamente como `SAAS_FEE` no `handlePaymentNotification`.
  - **Correção proposta**: Buscar o tenant no banco de dados pelo `mpAccessToken` ou `user_id` quando o `user_id` do webhook não corresponder ao da plataforma, retornando o `tenantId` correto.
  - **Prioridade**: Média (atualmente mitigado pelo fato de tenants terem seus próprios webhooks separados).
