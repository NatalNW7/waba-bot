"use client";

import {
  MessageSquare,
  Bot,
  CheckCircle,
  Users,
  CalendarCheck,
  Bell,
} from "lucide-react";
import { useState } from "react";

const steps = [
  {
    icon: MessageSquare,
    title: "Cliente envia mensagem",
    description: "Cliente envia mensagem para seu salão no WhatsApp",
    iconBg: "bg-barber-red",
  },
  {
    icon: Bot,
    title: "Assistente automatizado",
    description: "Cliqtree cuida da disponibilidade, opções e confirmações",
    iconBg: "bg-barber-blue",
  },
  {
    icon: CheckCircle,
    title: "Agendamento confirmado",
    description: "Reserva adicionada e cliente recebe lembretes",
    iconBg: "bg-barber-red",
  },
];

const features = [
  {
    icon: Users,
    title: "Conversações",
    description: "Converse com os clientes de forma natural e automatizada.",
  },
  {
    icon: CalendarCheck,
    title: "Respostas pré-prontas",
    description: "Configure respostas automáticas para perguntas frequentes.",
  },
  {
    icon: Bell,
    title: "Lembretes",
    description: "Envie lembretes automáticos para reduzir faltas.",
  },
];

export function HowItWorks() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            Como funciona
          </h2>
          <p className="text-lg text-muted-foreground">
            Três passos simples para agendamentos automatizados
          </p>
        </div>

        {/* Main steps - 3 column grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
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
                  className={`bg-white p-8 rounded-2xl text-center transition-all duration-300 border border-border/50 ${
                    hoveredIndex === index ? "shadow-xl scale-105" : "shadow-md"
                  }`}
                >
                  <div className="flex justify-center mb-6">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center ${step.iconBg} text-white`}
                    >
                      <Icon className="w-8 h-8" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Secondary features - 3 column grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl text-center border border-border/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-barber-blue text-barber-blue">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
