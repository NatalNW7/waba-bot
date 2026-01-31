"use client";

import { PaymentProvider } from "@/lib/dashboard/types";

interface ConfirmSwitchModalProps {
  newProvider: PaymentProvider;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ConfirmSwitchModal({
  newProvider,
  onConfirm,
  onCancel,
  isLoading,
}: ConfirmSwitchModalProps) {
  const providerName =
    newProvider === PaymentProvider.MERCADO_PAGO
      ? "Mercado Pago"
      : "InfinitePay";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-xl border border-border p-6 max-w-md mx-4 shadow-lg">
        <h3 className="font-semibold text-foreground text-lg">
          Trocar provedor de pagamento?
        </h3>
        <p className="text-muted-foreground mt-2">
          Deseja trocar para <strong>{providerName}</strong>? Sua configuração
          atual será desconectada.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Trocando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
