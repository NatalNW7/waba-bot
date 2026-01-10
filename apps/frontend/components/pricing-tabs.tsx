"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ISaasPlan, PaymentInterval } from "@repo/api-types";
import {
  formatPrice,
  getPeriodText,
  getIntervalLabel,
} from "@/lib/api/saas-plans";

interface PricingTabsProps {
  plansByInterval: Record<PaymentInterval, ISaasPlan[]>;
}

/**
 * Features list for each plan tier
 * Maps plan name to features
 */
const planFeatures: Record<string, { text: string; included: boolean }[]> = {
  Starter: [
    { text: "Até 100 agendamentos/mês", included: true },
    { text: "Integração com WhatsApp", included: true },
    { text: "Lembretes automatizados", included: true },
    { text: "Suporte por e-mail", included: true },
    { text: "Análises básicas", included: false },
    { text: "Suporte prioritário", included: false },
  ],
  Professional: [
    { text: "Até 500 agendamentos/mês", included: true },
    { text: "Integração com WhatsApp", included: true },
    { text: "Lembretes automatizados", included: true },
    { text: "Marca personalizada", included: true },
    { text: "Análises básicas", included: true },
    { text: "Suporte prioritário", included: false },
  ],
  Enterprise: [
    { text: "Agendamentos ilimitados", included: true },
    { text: "Integração com WhatsApp", included: true },
    { text: "Lembretes automatizados", included: true },
    { text: "Personalização completa", included: true },
    { text: "Análises avançadas", included: true },
    { text: "Suporte prioritário 24/7", included: true },
  ],
};

/**
 * Default features for unknown plan names
 */
const defaultFeatures = [
  { text: "Integração com WhatsApp", included: true },
  { text: "Lembretes automatizados", included: true },
  { text: "Suporte por e-mail", included: true },
];

function PlanCard({
  plan,
  isHighlighted,
}: {
  plan: ISaasPlan;
  isHighlighted: boolean;
}) {
  const features = planFeatures[plan.name] || defaultFeatures;

  return (
    <div
      className={`bg-background rounded-2xl p-8 relative transition-all hover:scale-[1.02] ${
        isHighlighted
          ? "border-2 border-primary shadow-xl"
          : "border border-border shadow-sm"
      }`}
    >
      {isHighlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
            Mais Popular
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {plan.description || "Plano ideal para o seu negócio"}
        </p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
          <span className="text-muted-foreground">
            /{getPeriodText(plan.interval)}
          </span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, featureIndex) => (
          <li key={featureIndex} className="flex items-start gap-3">
            {feature.included ? (
              <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            )}
            <span
              className={
                feature.included ? "text-foreground" : "text-muted-foreground"
              }
            >
              {feature.text}
            </span>
          </li>
        ))}
      </ul>

      <a
        href={`https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20assinar%20o%20plano%20${encodeURIComponent(plan.name)}%20${getIntervalLabel(plan.interval)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`block w-full text-center py-3 rounded-lg font-semibold transition-all ${
          isHighlighted
            ? "bg-primary text-primary-foreground hover:bg-whatsapp-dark"
            : "bg-secondary text-secondary-foreground hover:bg-muted"
        }`}
      >
        Começar Agora
      </a>
    </div>
  );
}

export function PricingTabs({ plansByInterval }: PricingTabsProps) {
  const [activeTab, setActiveTab] = useState<PaymentInterval>(
    PaymentInterval.MONTHLY,
  );

  const intervals: PaymentInterval[] = [
    PaymentInterval.MONTHLY,
    PaymentInterval.QUARTERLY,
    PaymentInterval.YEARLY,
  ];

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as PaymentInterval)}
      className="w-full"
    >
      <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
        {intervals.map((interval) => (
          <TabsTrigger
            key={interval}
            value={interval}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {getIntervalLabel(interval)}
            {interval === PaymentInterval.YEARLY && (
              <span className="ml-2 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                -20%
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {intervals.map((interval) => (
        <TabsContent key={interval} value={interval} className="mt-0">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plansByInterval[interval].map((plan, index) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isHighlighted={index === 1} // Middle plan is highlighted
              />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
