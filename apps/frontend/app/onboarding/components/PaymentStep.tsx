"use client";

import { useEffect } from "react";
import { type ISaasPlan } from "@repo/api-types";
import { type BusinessInfo } from "./BusinessInfoStep";
import { initMercadoPago, CardPayment } from "@mercadopago/sdk-react";

interface PaymentStepProps {
  businessInfo: BusinessInfo;
  selectedPlan: ISaasPlan;
  email: string;
  isSubmitting: boolean;
  error: string | null;
  onConfirm: (cardTokenId: string, payerEmail: string) => Promise<void>;
  onBack: () => void;
}

export function PaymentStep({
  businessInfo,
  selectedPlan,
  email,
  isSubmitting,
  error,
  onConfirm,
  onBack,
}: PaymentStepProps) {
  useEffect(() => {
    // Initialize Mercado Pago with the public key
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    if (publicKey) {
      initMercadoPago(publicKey);
    } else {
      console.error("Mercado Pago Public Key is not defined");
    }
  }, []);

  const initialization = {
    amount: Number(selectedPlan.price),
    payer: {
      email,
    },
  };

  const onSubmit = async (formData: any) => {
    // Extract token and payer email from the form data
    const token = formData.token;
    const payerEmail = formData.payer?.email || email;

    if (token) {
      await onConfirm(token, payerEmail);
    }
  };

  const onError = async (error: any) => {
    console.error("Mercado Pago Brick Error:", error);
  };

  const onReady = async () => {
    // Optional: Hide a loading spinner here when Brick is ready
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Pagamento da Assinatura
      </h1>
      <p className="text-muted-foreground mb-6">
        Insira os dados do seu cartão para assinar o plano {selectedPlan.name}{" "}
        (R$ {Number(selectedPlan.price).toFixed(2)}/mês).
      </p>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="mb-6 relative min-h-[400px]">
        {/* We add pointer-events-none and opacity to prevent double submission */}
        <div className={isSubmitting ? "pointer-events-none opacity-50" : ""}>
          <CardPayment
            initialization={initialization}
            onSubmit={onSubmit}
            onReady={onReady}
            onError={onError}
            customization={{
              visual: {
                hideFormTitle: true,
              },
            }}
          />
        </div>

        {isSubmitting && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-2"></div>
              <p className="text-sm font-medium">Processando pagamento...</p>
            </div>
          </div>
        )}
      </div>

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
