"use client";

import { type ISaasPlan } from "@repo/api-types";
import { type BusinessInfo } from "./BusinessInfoStep";

interface ConfirmationStepProps {
  businessInfo: BusinessInfo;
  selectedPlan: ISaasPlan;
  email: string;
  isSubmitting: boolean;
  error: string | null;
  onConfirm: () => void;
  onBack: () => void;
}

export function ConfirmationStep({
  businessInfo,
  selectedPlan,
  email,
  isSubmitting,
  error,
  onConfirm,
  onBack,
}: ConfirmationStepProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Confirme seus dados
      </h1>
      <p className="text-muted-foreground mb-6">
        Revise as informações antes de criar sua conta.
      </p>

      <div className="bg-muted rounded-lg p-4 space-y-3 mb-6">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Negócio:</span>
          <span className="font-medium text-foreground">
            {businessInfo.name}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Telefone:</span>
          <span className="font-medium text-foreground">
            {businessInfo.phone}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Email:</span>
          <span className="font-medium text-foreground">
            {email}
            <span className="ml-2 text-xs text-primary">✓ Verificado</span>
          </span>
        </div>
        <hr className="border-border" />
        <div className="flex justify-between">
          <span className="text-muted-foreground">Plano:</span>
          <span className="font-medium text-foreground">
            {selectedPlan.name}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Valor:</span>
          <span className="font-bold text-primary">
            R$ {Number(selectedPlan.price).toFixed(2)}/mês
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <button
        onClick={onConfirm}
        disabled={isSubmitting}
        className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? "Criando..." : "Criar meu negócio"}
      </button>

      <button
        onClick={onBack}
        disabled={isSubmitting}
        className="w-full mt-4 px-4 py-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        ← Voltar
      </button>
    </div>
  );
}
