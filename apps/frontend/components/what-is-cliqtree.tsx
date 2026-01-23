export function WhatIsCliqtree() {
  return (
    <section className="py-20 bg-cream">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* White card with shadow */}
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12 border border-border/50">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-foreground">
              O que é o Cliqtree?
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed text-center">
              O Cliqtree é um serviço de{" "}
              <strong className="text-foreground">automação inteligente</strong>{" "}
              que transforma a forma como salões de beleza, cabeleireiros e
              barbearias gerenciam agendamentos. Ao se integrar diretamente ao
              WhatsApp, ele cuida de agendamentos, confirmações e lembretes
              automaticamente —{" "}
              <span className="text-barber-red font-medium">
                reduzindo faltas e liberando sua equipe
              </span>{" "}
              para focar no que realmente importa: oferecer um atendimento
              excepcional.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
