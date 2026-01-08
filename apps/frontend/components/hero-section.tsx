import { MessageCircle, ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section id="home" className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background with overlay */}
      <div className="absolute inset-0 -z-10">
        <img src="/placeholder.svg?height=800&width=1600" alt="" className="w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance mb-6">
            Agendamento automatizado via WhatsApp para <span className="text-primary">salões e barbearias</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Permita que clientes agendem em segundos — automatizado, confiável e integrado ao WhatsApp. Um assistente
            que cuida de solicitações, confirmações e lembretes — para que sua equipe foque nos clientes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/5511913339320?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20Cliqtree"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-whatsapp-dark transition-all hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="w-5 h-5" />
              Agendar via WhatsApp
            </a>

            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-muted transition-all"
            >
              Saiba como funciona
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
