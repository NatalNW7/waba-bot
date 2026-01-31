"use client";

import { MercadoPagoIcon } from "@/components/icons/mercado-pago-icon";

interface MercadoPagoCardProps {
  isConnected: boolean;
  isSavedToBackend: boolean;
  onSave: () => void;
  onSwitch: () => void;
  isLoading: boolean;
}

export function MercadoPagoCard({
  isConnected,
  isSavedToBackend,
  onSave,
  onSwitch,
  isLoading,
}: MercadoPagoCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#009ee3]/10 flex items-center justify-center flex-shrink-0">
            <MercadoPagoIcon />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Mercado Pago</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isSavedToBackend
                ? isConnected
                  ? "Sua conta está conectada e pronta para receber pagamentos."
                  : "Conecte sua conta para receber pagamentos de clientes."
                : "Confirme sua seleção para usar o Mercado Pago."}
            </p>
          </div>
        </div>
        {isSavedToBackend && (
          <button
            onClick={onSwitch}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Trocar ↔
          </button>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        {!isSavedToBackend ? (
          // Show save button when not yet saved to backend
          <button
            onClick={onSave}
            disabled={isLoading}
            className="w-full py-2.5 bg-[#009ee3] text-white rounded-lg font-medium hover:bg-[#008bd0] transition-colors disabled:opacity-50"
          >
            {isLoading ? "Salvando..." : "Confirmar Mercado Pago"}
          </button>
        ) : isConnected ? (
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
  );
}
