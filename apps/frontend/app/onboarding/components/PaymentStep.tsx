"use client";

import { type ISaasPlan } from "@repo/api-types";
import { type BusinessInfo } from "./BusinessInfoStep";

interface PaymentStepProps {
  businessInfo: BusinessInfo;
  selectedPlan: ISaasPlan;
  email: string;
  isSubmitting: boolean;
  error: string | null;
  onConfirm: () => Promise<void>;
  onBack: () => void;
}

export function PaymentStep({
  selectedPlan,
  isSubmitting,
  error,
  onConfirm,
  onBack,
}: PaymentStepProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Resumo da Assinatura
      </h1>
      <p className="text-muted-foreground mb-6">
        Você está prestes a assinar o plano <strong>{selectedPlan.name}</strong>.
        O valor da assinatura é de <strong>R$ {Number(selectedPlan.price).toFixed(2)}/mês</strong>.
      </p>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h3 className="font-semibold text-lg mb-4">Detalhes do Plano</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Plano selecionado</span>
            <span className="font-medium">{selectedPlan.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ciclo de cobrança</span>
            <span className="font-medium">Mensal</span>
          </div>
          <div className="pt-3 border-t border-border flex justify-between">
            <span className="font-semibold">Total a pagar hoje</span>
            <span className="font-bold text-primary">
              R$ {Number(selectedPlan.price).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent"></div>
              <span>Processando...</span>
            </>
          ) : (
            <span>Assinar com Mercado Pago</span>
          )}
        </button>

        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full px-4 py-2 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
        >
          ← Voltar e escolher outro plano
        </button>
      </div>
    </div>
  );
}
