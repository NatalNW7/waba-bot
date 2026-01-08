import { Check, X } from "lucide-react"

const plans = [
  {
    name: "Teste Grátis",
    price: "R$ 0",
    period: "14 dias",
    description: "Experimente todos os recursos sem riscos",
    features: [
      { text: "Até 50 agendamentos", included: true },
      { text: "Integração com WhatsApp", included: true },
      { text: "Lembretes automatizados", included: true },
      { text: "Personalização básica", included: true },
      { text: "Suporte por e-mail", included: true },
      { text: "Análises avançadas", included: false },
      { text: "Suporte prioritário", included: false },
    ],
    cta: "Iniciar Teste Grátis",
    highlighted: false,
  },
  {
    name: "Básico",
    price: "R$ 99",
    period: "por mês",
    description: "Perfeito para pequenos salões",
    features: [
      { text: "Até 200 agendamentos/mês", included: true },
      { text: "Integração com WhatsApp", included: true },
      { text: "Lembretes automatizados", included: true },
      { text: "Marca personalizada", included: true },
      { text: "Suporte por e-mail", included: true },
      { text: "Análises básicas", included: true },
      { text: "Suporte prioritário", included: false },
    ],
    cta: "Começar Agora",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "R$ 199",
    period: "por mês",
    description: "Para negócios em crescimento",
    features: [
      { text: "Agendamentos ilimitados", included: true },
      { text: "Integração com WhatsApp", included: true },
      { text: "Lembretes automatizados", included: true },
      { text: "Personalização completa", included: true },
      { text: "Suporte prioritário 24/7", included: true },
      { text: "Análises avançadas", included: true },
      { text: "Múltiplas localizações", included: true },
    ],
    cta: "Obter Premium",
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Preços simples e transparentes</h2>
          <p className="text-lg text-muted-foreground">Escolha o plano que se encaixa no seu negócio</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-background rounded-2xl p-8 relative transition-all hover:scale-[1.02] ${
                plan.highlighted ? "border-2 border-primary shadow-xl" : "border border-border shadow-sm"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Mais Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={`https://wa.me/5511999999999?text=Olá!%20Gostaria%20de%20assinar%20o%20plano%20${plan.name}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full text-center py-3 rounded-lg font-semibold transition-all ${
                  plan.highlighted
                    ? "bg-primary text-primary-foreground hover:bg-whatsapp-dark"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {plan.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
