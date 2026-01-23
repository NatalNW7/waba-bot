import { Clock, TrendingUp, BellRing, Globe2, Zap, Shield } from "lucide-react";

const benefits = [
  {
    icon: Clock,
    title: "Economize tempo da equipe",
    description:
      "Elimine ligações de agendamento manual e foque em atender clientes",
    iconColor: "red",
  },
  {
    icon: TrendingUp,
    title: "Aumente os agendamentos",
    description:
      "Disponível 24/7 para capturar compromissos mesmo após o horário comercial",
    iconColor: "blue",
  },
  {
    icon: BellRing,
    title: "Reduza faltas",
    description:
      "Lembretes automatizados e cobrança antecipada mantêm clientes informados e comprometidos",
    iconColor: "red",
  },
  {
    icon: Globe2,
    title: "Disponibilidade 24/7",
    description: "Nunca perca uma oportunidade de agendamento, dia ou noite",
    iconColor: "blue",
  },
  {
    icon: Zap,
    title: "Configuração fácil no WhatsApp",
    description: "Integração simples com seu WhatsApp Business existente",
    iconColor: "red",
  },
  {
    icon: Shield,
    title: "Apresentação profissional",
    description: "Comunicação consistente e profissional com cada cliente",
    iconColor: "blue",
  },
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-20 bg-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            Benefícios para seu negócio
          </h2>
          <p className="text-lg text-muted-foreground">
            Transforme seu processo de agendamento e expanda seu salão
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const isRed = benefit.iconColor === "red";

            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] border border-border/50"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      isRed
                        ? "bg-barber-red text-white"
                        : "border-2 border-barber-blue text-barber-blue"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
