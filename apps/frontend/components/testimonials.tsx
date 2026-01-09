import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "O Cliqtree transformou nosso salão. Tivemos um aumento de 30% nos agendamentos no primeiro mês, e as faltas caíram drasticamente.",
    author: "Maria Silva",
    role: "Proprietária, Bella Hair Salon",
  },
  {
    quote:
      "Meus clientes adoram como é fácil agendar. Eu adoro não passar horas ao telefone. É vantajoso para todos.",
    author: "Carlos Mendes",
    role: "Barbeiro Master, Urban Cuts",
  },
  {
    quote:
      "Só os lembretes automatizados já se pagaram. Passamos de 20% de faltas para menos de 5%.",
    author: "Ana Costa",
    role: "Gerente, Style Studio",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-muted-foreground">
            Resultados reais de negócios reais
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-secondary p-8 rounded-2xl relative">
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />

              <p className="text-foreground leading-relaxed mb-6 relative z-10">
                "{testimonial.quote}"
              </p>

              <div className="border-t border-border pt-4">
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats highlight */}
        <div className="mt-16 max-w-3xl mx-auto bg-primary/10 border-2 border-primary/20 rounded-2xl p-8 text-center">
          <div className="text-5xl font-bold text-primary mb-2">+30%</div>
          <div className="text-xl font-semibold mb-2">
            Mais agendamentos em 30 dias
          </div>
          <div className="text-muted-foreground">
            Resultado médio entre nossos parceiros de salão
          </div>
        </div>
      </div>
    </section>
  );
}
