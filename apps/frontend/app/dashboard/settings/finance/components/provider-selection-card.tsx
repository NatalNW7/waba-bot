"use client";

import { PaymentProvider } from "@/lib/dashboard/types";
import { MercadoPagoIcon } from "@/components/icons/mercado-pago-icon";
import { InfinitePayIcon } from "@/components/icons/infinite-pay-icon";

interface ProviderSelectionCardProps {
  onSelect: (provider: PaymentProvider) => void;
  isLoading: boolean;
}

export function ProviderSelectionCard({
  onSelect,
  isLoading,
}: ProviderSelectionCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6 lg:col-span-2">
      <h3 className="font-semibold text-foreground text-lg">
        Escolha seu provedor de pagamento
      </h3>
      <p className="text-sm text-muted-foreground mt-1">
        Selecione como seus clientes irão pagar pelos serviços
      </p>

      <div className="grid md:grid-cols-2 gap-4 mt-6">
        {/* Mercado Pago Option */}
        <div className="border border-border rounded-xl p-5 hover:border-[#009ee3]/50 hover:bg-[#009ee3]/5 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#009ee3]/10 flex items-center justify-center">
              <MercadoPagoIcon />
            </div>
            <h4 className="font-semibold text-foreground">Mercado Pago</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            PIX, cartões e boleto. Integração via OAuth.
          </p>
          <button
            onClick={() => onSelect(PaymentProvider.MERCADO_PAGO)}
            disabled={isLoading}
            className="w-full py-2.5 bg-[#009ee3] text-white rounded-lg font-medium hover:bg-[#008bd0] transition-colors disabled:opacity-50"
          >
            Selecionar
          </button>
        </div>

        {/* InfinitePay Option */}
        <div className="border border-border rounded-xl p-5 hover:border-[#00c853]/50 hover:bg-[#00c853]/5 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#00c853]/10 flex items-center justify-center">
              <InfinitePayIcon />
            </div>
            <h4 className="font-semibold text-foreground">InfinitePay</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Link de pagamento com taxas competitivas.
          </p>
          <button
            onClick={() => onSelect(PaymentProvider.INFINITE_PAY)}
            disabled={isLoading}
            className="w-full py-2.5 bg-[#00c853] text-white rounded-lg font-medium hover:bg-[#00b348] transition-colors disabled:opacity-50"
          >
            Selecionar
          </button>
        </div>
      </div>
    </div>
  );
}
