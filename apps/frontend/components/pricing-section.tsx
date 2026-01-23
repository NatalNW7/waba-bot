import { getSaasPlans, groupPlansByInterval } from "@/lib/api/saas-plans";
import { PricingTabs } from "./pricing-tabs";

export async function PricingSection() {
  const plans = await getSaasPlans();
  const plansByInterval = groupPlansByInterval(plans);

  const hasPlans = plans.length > 0;

  return (
    <section id="pricing" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Preços simples e transparentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Escolha o plano que se encaixa no seu negócio
          </p>
        </div>

        {hasPlans ? (
          <PricingTabs plansByInterval={plansByInterval} />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Nenhum plano disponível no momento.
            </p>
            <p className="text-muted-foreground mt-2">
              Entre em contato para mais informações.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
