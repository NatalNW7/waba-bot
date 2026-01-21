"use client";

import { BrazilianPhoneInput } from "@/components/ui/brazilian-phone-input";

export interface BusinessInfo {
  name: string;
  phone: string;
}

interface BusinessInfoStepProps {
  businessInfo: BusinessInfo;
  onBusinessInfoChange: (info: BusinessInfo) => void;
  onSubmit: () => void;
}

export function BusinessInfoStep({
  businessInfo,
  onBusinessInfoChange,
  onSubmit,
}: BusinessInfoStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessInfo.name && businessInfo.phone) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Conte-nos sobre seu negócio
      </h1>
      <p className="text-muted-foreground mb-6">
        Essas informações serão usadas para criar seu perfil comercial.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Nome do negócio
          </label>
          <input
            type="text"
            value={businessInfo.name}
            onChange={(e) =>
              onBusinessInfoChange({ ...businessInfo, name: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ex: Barbearia do João"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Telefone
          </label>
          <BrazilianPhoneInput
            value={businessInfo.phone}
            onChange={(phone) =>
              onBusinessInfoChange({ ...businessInfo, phone })
            }
            required
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full mt-6 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
      >
        Continuar
      </button>
    </form>
  );
}
