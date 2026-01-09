import { Sparkles } from "lucide-react";

export function WhatIsCliqtree() {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-shrink-0 w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              O que é o Cliqtree?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              O Cliqtree é um serviço de automação inteligente que transforma a
              forma como salões de beleza, cabeleireiros e barbearias gerenciam
              agendamentos. Ao se integrar diretamente ao WhatsApp, ele cuida do
              agendamento, confirmações e lembretes automaticamente — reduzindo
              faltas e liberando sua equipe para focar no que realmente importa:
              oferecer um atendimento excepcional.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
