"use client";

import { useState } from "react";
import { type ISaasPlan, PaymentInterval } from "@repo/api-types";

interface PlanSelectionStepProps {
  plans: ISaasPlan[];
  onPlanSelect: (plan: ISaasPlan) => void;
  onBack: () => void;
}

const INTERVAL_TABS = [
  { value: PaymentInterval.MONTHLY, label: "Mensal" },
  { value: PaymentInterval.QUARTERLY, label: "Trimestral" },
  { value: PaymentInterval.YEARLY, label: "Anual" },
] as const;

function getIntervalLabel(interval: PaymentInterval): string {
  switch (interval) {
    case PaymentInterval.MONTHLY:
      return "mês";
    case PaymentInterval.QUARTERLY:
      return "trimestre";
    case PaymentInterval.YEARLY:
      return "ano";
    default:
      return "mês";
  }
}

export function PlanSelectionStep({
  plans,
  onPlanSelect,
  onBack,
}: PlanSelectionStepProps) {
  const [selectedInterval, setSelectedInterval] = useState<PaymentInterval>(
    PaymentInterval.MONTHLY,
  );

  const filteredPlans = plans.filter(
    (plan) => plan.interval === selectedInterval,
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Escolha seu plano
      </h1>
      <p className="text-muted-foreground mb-6">
        Selecione o plano que melhor atende às necessidades do seu negócio.
      </p>

      {/* Interval Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
        {INTERVAL_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setSelectedInterval(tab.value)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              selectedInterval === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.value === PaymentInterval.YEARLY && (
              <span className="ml-1 text-xs text-primary">Economia!</span>
            )}
          </button>
        ))}
      </div>

      {/* Plan Cards */}
      <div className="grid gap-4">
        {filteredPlans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => onPlanSelect(plan)}
            className="p-4 rounded-lg border border-border hover:border-primary text-left transition-colors group"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {plan.description}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  R$ {Number(plan.price).toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">
                  /{getIntervalLabel(selectedInterval)}
                </div>
              </div>
            </div>
          </button>
        ))}
        {filteredPlans.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum plano disponível neste período.
          </div>
        )}
      </div>

      <button
        onClick={onBack}
        className="w-full mt-4 px-4 py-2 text-muted-foreground hover:text-foreground"
      >
        ← Voltar
      </button>
    </div>
  );
}
