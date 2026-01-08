import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Termos de Serviço | Cliqtree",
  description: "Termos de Serviço do Cliqtree - Condições de uso da nossa plataforma de automação",
}

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Termos de Serviço – Cliqtree</h1>
          <p className="text-muted-foreground mb-12">Última atualização: 23 de Dezembro de 2025</p>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed mb-8">
              Ao contratar ou utilizar os serviços do Cliqtree, você ("Contratante", "Profissional" ou "Usuário")
              concorda com os seguintes termos e condições. Leia-os atentamente antes de ativar sua automação.
            </p>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">1. Objeto do Serviço</h2>
              <p className="leading-relaxed">
                O Cliqtree fornece uma plataforma de inteligência artificial agêntica para a automação de atendimentos e
                agendamentos via WhatsApp, especificamente voltada para salões de beleza, barbearias e profissionais
                autônomos do setor.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">2. Responsabilidades do Contratante</h2>
              <p className="leading-relaxed mb-4">Ao utilizar o Cliqtree, o Contratante declara e garante que:</p>
              <ul className="space-y-2 ml-6">
                <li className="leading-relaxed">Fornecerá informações verídicas sobre horários, serviços e preços.</li>
                <li className="leading-relaxed">
                  Possui autorização legal para realizar os serviços oferecidos em seu estabelecimento.
                </li>
                <li className="leading-relaxed">
                  É responsável pela manutenção e conexão do número de WhatsApp utilizado para a automação.
                </li>
                <li className="leading-relaxed">
                  Responderá por qualquer interação humana necessária que a IA não possa resolver.
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">3. Uso da Conta e Segurança</h2>
              <ul className="space-y-2 ml-6">
                <li className="leading-relaxed">O acesso à plataforma é pessoal e intransferível.</li>
                <li className="leading-relaxed">
                  O Contratante é responsável por manter a confidencialidade de suas credenciais de acesso.
                </li>
                <li className="leading-relaxed">
                  O Cliqtree não se responsabiliza por perdas decorrentes do uso indevido da conta por terceiros.
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">4. Disponibilidade e Limitações da IA</h2>
              <ul className="space-y-4 ml-6">
                <li className="leading-relaxed">
                  <strong>Natureza da IA:</strong> O Cliqtree busca simular um assistente humano, mas o Contratante
                  compreende que a IA pode apresentar interpretações incorretas em casos de mensagens ambíguas dos
                  clientes finais.
                </li>
                <li className="leading-relaxed">
                  <strong>Manutenção:</strong> Reservamo-nos o direito de realizar manutenções programadas que podem
                  interromper temporariamente o serviço.
                </li>
                <li className="leading-relaxed">
                  <strong>Dependência de Terceiros:</strong> O funcionamento do Cliqtree depende da estabilidade do
                  WhatsApp (Meta) e de serviços de internet. Falhas nessas plataformas externas não são de
                  responsabilidade do Cliqtree.
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">5. Pagamentos e Planos</h2>
              <ul className="space-y-2 ml-6">
                <li className="leading-relaxed">
                  Os serviços são oferecidos mediante assinatura (mensal/anual), conforme o plano escolhido.
                </li>
                <li className="leading-relaxed">
                  O atraso no pagamento poderá resultar na suspensão imediata da automação.
                </li>
                <li className="leading-relaxed">
                  Reajustes de preços serão comunicados com antecedência mínima de 30 dias.
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">6. Cancelamento e Rescisão</h2>
              <ul className="space-y-2 ml-6">
                <li className="leading-relaxed">
                  O Contratante pode solicitar o cancelamento a qualquer momento, observando as regras de fidelidade do
                  plano contratado (se houver).
                </li>
                <li className="leading-relaxed">
                  O Cliqtree reserva-se o direito de encerrar contas que violem as políticas de spam do WhatsApp ou
                  utilizem a ferramenta para fins ilícitos.
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">7. Propriedade Intelectual</h2>
              <p className="leading-relaxed">
                Todo o código, algoritmos, logotipos e design da plataforma Cliqtree são de propriedade exclusiva da
                empresa. É proibida qualquer tentativa de engenharia reversa ou cópia da tecnologia.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">8. Limitação de Responsabilidade</h2>
              <p className="leading-relaxed mb-4">O Cliqtree não será responsável por:</p>
              <ul className="space-y-2 ml-6">
                <li className="leading-relaxed">Lucros cessantes decorrentes de erros de agendamento.</li>
                <li className="leading-relaxed">Falta de comparecimento (no-show) de clientes finais.</li>
                <li className="leading-relaxed">
                  Bloqueios de números de WhatsApp realizados pela Meta devido ao uso da ferramenta de forma abusiva.
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">9. Foro</h2>
              <p className="leading-relaxed">
                Para dirimir quaisquer controvérsias oriundas deste termo, as partes elegem o foro da comarca de São
                Paulo - SP.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground text-center">
              Ao utilizar o Cliqtree, você confirma que leu e concorda com estes Termos de Serviço.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
