import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section id="home" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Barber stripe background - slightly desaturated */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `repeating-linear-gradient(
            135deg,
            #f5f5f5 0px,
            #f5f5f5 25px,
            #2a4a6e 25px,
            #2a4a6e 50px,
            #f5f5f5 50px,
            #f5f5f5 75px,
            #c94a5a 75px,
            #c94a5a 100px
          )`,
          opacity: 0.85,
        }}
      ></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Glassmorphism card */}
          <div
            className="text-center p-8 sm:p-12 rounded-2xl shadow-xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.92)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance mb-6 text-foreground">
              Agendamento automatizado via WhatsApp para{" "}
              <span className="text-barber-red">profissionais da beleza</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Permita que clientes agendem em segundos — automatizado, confiável
              e integrado ao WhatsApp. Um assistente que cuida de solicitações,
              confirmações e lembretes — para que sua equipe foque nos clientes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 bg-barber-red text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-barber-red/90 transition-all hover:scale-105 shadow-lg"
              >
                Saiba como funciona
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
