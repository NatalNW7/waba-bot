"use client";

import type { DashboardPayment } from "@/lib/dashboard/types";
import { StatusBadge } from "@/components/dashboard/status-badge";

interface PaymentHistoryTableProps {
  payments: DashboardPayment[];
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  return (
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
  );
}
