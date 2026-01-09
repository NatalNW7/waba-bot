"use client";

import { MessageSquare, Bot, CheckCircle } from "lucide-react";
import { useState } from "react";

const steps = [
  {
    icon: MessageSquare,
    title: "Cliente envia mensagem",
    description: "Cliente envia mensagem para seu salão no WhatsApp",
  },
  {
    icon: Bot,
    title: "Assistente automatizado",
    description: "Cliqtree cuida da disponibilidade, opções e confirmações",
  },
  {
    icon: CheckCircle,
    title: "Agendamento confirmado",
    description: "Reserva adicionada e cliente recebe lembretes",
  },
];

export function HowItWorks() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Como funciona</h2>
          <p className="text-lg text-muted-foreground">
            Três passos simples para agendamentos automatizados
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={`bg-secondary p-8 rounded-2xl text-center transition-all duration-300 ${
                    hoveredIndex === index
                      ? "shadow-xl scale-105 bg-primary/5"
                      : "shadow-md"
                  }`}
                >
                  <div className="flex justify-center mb-6">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                        hoveredIndex === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="mb-2 text-sm font-semibold text-primary">
                    Passo {index + 1}
                  </div>

                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connector arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-0.5 bg-border"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
