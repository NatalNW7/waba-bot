"use client";

import { useCurrentTenant, usePayments } from "@/lib/hooks";
import {
  SubscriptionStatus,
  subscriptionStatusColors,
  paymentIntervalLabels,
} from "@/lib/dashboard/types";
import type { DashboardTenant, DashboardPayment } from "@/lib/dashboard/types";

export default function FinanceSettingsPage() {
  // Fetch data using React Query
  const { data: tenantData, isLoading: tenantLoading } = useCurrentTenant();
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments();

  const tenant = (tenantData as DashboardTenant) || null;
  const payments = (paymentsData as DashboardPayment[]) || [];
  const isLoading = tenantLoading || paymentsLoading;

  const hasMercadoPago = !!tenant?.mpAccessToken;

  const statusLabels: Record<SubscriptionStatus, string> = {
    [SubscriptionStatus.ACTIVE]: "Ativa",
    [SubscriptionStatus.PAST_DUE]: "Pendente",
    [SubscriptionStatus.CANCELED]: "Cancelada",
    [SubscriptionStatus.EXPIRED]: "Expirada",
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-5 w-64 bg-muted rounded mt-2 animate-pulse" />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 animate-pulse">
            <div className="h-32 bg-muted rounded" />
          </div>
          <div className="bg-card rounded-xl border border-border p-6 animate-pulse">
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Erro ao carregar dados do tenant
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas integrações de pagamento e assinatura
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Mercado Pago Card */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#009ee3]/10 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-[#009ee3]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.523 0-10-4.477-10-10S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-15h2v6h-2zm0 8h2v2h-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Mercado Pago</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {hasMercadoPago
                  ? "Sua conta está conectada e pronta para receber pagamentos."
                  : "Conecte sua conta para receber pagamentos de clientes."}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            {hasMercadoPago ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Conectado
                  </span>
                </div>
                <button className="text-sm text-destructive hover:underline">
                  Desconectar
                </button>
              </div>
            ) : (
              <button className="w-full py-2.5 bg-[#009ee3] text-white rounded-lg font-medium hover:bg-[#008bd0] transition-colors">
                Conectar Mercado Pago
              </button>
            )}
          </div>
        </div>

        {/* SaaS Subscription Card */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Sua Assinatura</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Plano atual e status de pagamento
              </p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor:
                  subscriptionStatusColors[tenant.saasStatus] + "20",
                color: subscriptionStatusColors[tenant.saasStatus],
              }}
            >
              {statusLabels[tenant.saasStatus]}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Plano</span>
              <span className="font-semibold text-foreground">
                {tenant.saasPlan?.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Valor</span>
              <span className="font-semibold text-foreground">
                R$ {tenant.saasPlan?.price}
                <span className="font-normal text-muted-foreground">
                  /
                  {paymentIntervalLabels[
                    tenant.saasPlan?.interval || "MONTHLY"
                  ].toLowerCase()}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Próxima cobrança</span>
              <span className="font-semibold text-foreground">
                {tenant.saasNextBilling
                  ? new Date(tenant.saasNextBilling).toLocaleDateString("pt-BR")
                  : "-"}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <button className="text-sm text-primary font-medium hover:underline">
              Alterar plano
            </button>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">
            Histórico de Pagamentos
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Pagamentos da sua assinatura SaaS
          </p>
        </div>

        {/* Mobile view */}
        <div className="sm:hidden divide-y divide-border">
          {payments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum pagamento encontrado
            </div>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-foreground font-medium">
                    R$ {payment.amount}
                  </span>
                  <StatusBadge
                    status={payment.statusLabel}
                    color={payment.statusColor}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Date(payment.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                  <span className="text-muted-foreground">
                    {payment.method === "PIX" ? "PIX" : "Cartão"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop view */}
        <div className="hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Data
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Valor
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Taxa
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Líquido
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Método
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Nenhum pagamento encontrado
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-foreground">
                      {new Date(payment.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      R$ {payment.amount}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      R$ {payment.fee || "0.00"}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      R$ {payment.netAmount || payment.amount}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {payment.method === "PIX" ? "PIX" : "Cartão de Crédito"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={payment.statusLabel}
                        color={payment.statusColor}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status, color }: { status: string; color: string }) {
  const colorClasses = {
    green:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    yellow:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses[color as keyof typeof colorClasses]}`}
    >
      {status}
    </span>
  );
}
