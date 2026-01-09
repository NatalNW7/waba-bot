import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata = {
  title: "Política de Privacidade | Cliqtree",
  description:
    "Política de Privacidade do Cliqtree - Como coletamos, usamos e protegemos suas informações",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-4xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Política de Privacidade – Cliqtree
          </h1>
          <p className="text-muted-foreground mb-12">
            Última atualização: 23 de Dezembro de 2025
          </p>

          <div className="prose prose-lg max-w-none">
            <p className="text-lg leading-relaxed mb-8">
              Bem-vindo ao Cliqtree. A sua privacidade e a confiança que você
              deposita em nossa automação são fundamentais para nós. Esta
              Política de Privacidade explica como coletamos, usamos,
              processamos e protegemos as informações dos profissionais (nossos
              Clientes) e dos usuários finais (clientes do salão/barbearia).
            </p>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">
                1. Informações que Coletamos
              </h2>
              <p className="leading-relaxed mb-4">
                Para que o assistente virtual Cliqtree funcione de forma
                inteligente, coletamos:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="leading-relaxed">
                  <strong>Dados do Profissional/Estabelecimento:</strong> Nome,
                  e-mail, telefone, nome do salão/barbearia e dados de
                  faturamento.
                </li>
                <li className="leading-relaxed">
                  <strong>Dados de Clientes Finais:</strong> Nome e número de
                  telefone obtidos via WhatsApp, além de horários e serviços
                  solicitados.
                </li>
                <li className="leading-relaxed">
                  <strong>Integração com WhatsApp:</strong> Conteúdo das
                  mensagens trocadas exclusivamente para fins de triagem,
                  agendamento e resposta automática.
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">
                2. Finalidade do Tratamento de Dados
              </h2>
              <p className="leading-relaxed mb-4">
                O Cliqtree utiliza os dados coletados exclusivamente para:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="leading-relaxed">
                  <strong>Automação de Agendamentos:</strong> Processar pedidos
                  de horários 24h por dia.
                </li>
                <li className="leading-relaxed">
                  <strong>Gestão de Agenda:</strong> Organizar os horários do
                  profissional e evitar conflitos.
                </li>
                <li className="leading-relaxed">
                  <strong>Lembretes e Notificações:</strong> Enviar confirmações
                  e lembretes de agendamento para reduzir faltas.
                </li>
                <li className="leading-relaxed">
                  <strong>Melhoria da IA:</strong> Aprimorar as respostas do
                  assistente agêntico para o nicho de beleza.
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">
                3. Compartilhamento de Dados
              </h2>
              <p className="leading-relaxed mb-4">
                O Cliqtree não vende dados de usuários. O compartilhamento
                ocorre apenas quando estritamente necessário para a operação:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="leading-relaxed">
                  <strong>Provedores de Infraestrutura:</strong> Servidores de
                  hospedagem e APIs de comunicação (como a API do WhatsApp).
                </li>
                <li className="leading-relaxed">
                  <strong>Cumprimento Legal:</strong> Caso sejamos obrigados por
                  lei ou ordem judicial.
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">
                4. Segurança das Informações
              </h2>
              <p className="leading-relaxed">
                Implementamos medidas técnicas para proteger os dados contra
                acessos não autorizados. No entanto, por operarmos via
                integração com o WhatsApp, a segurança das mensagens também
                depende das práticas de segurança da própria plataforma Meta.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">
                5. Seus Direitos (LGPD)
              </h2>
              <p className="leading-relaxed mb-4">
                Como titular de dados, você e seus clientes finais têm o direito
                de:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="leading-relaxed">
                  Confirmar a existência de tratamento de dados.
                </li>
                <li className="leading-relaxed">
                  Acessar, corrigir ou excluir seus dados de nossa base de
                  agendamento.
                </li>
                <li className="leading-relaxed">
                  Revogar o consentimento para o uso da ferramenta a qualquer
                  momento.
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">6. Retenção de Dados</h2>
              <p className="leading-relaxed">
                Mantemos as informações de agendamento enquanto forem
                necessárias para a prestação do serviço ou para fins de
                histórico de gestão do salão, a menos que a exclusão seja
                solicitada.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-4">7. Contato</h2>
              <p className="leading-relaxed mb-4">
                Para questões relacionadas à privacidade ou para exercer seus
                direitos, entre em contato através do nosso canal oficial:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="leading-relaxed">
                  <strong>E-mail:</strong>{" "}
                  <a
                    href="mailto:cliqtreeoficial@gmail.com"
                    className="text-primary hover:underline"
                  >
                    cliqtreeoficial@gmail.com
                  </a>
                </li>
                <li className="leading-relaxed">
                  <strong>Site:</strong>{" "}
                  <a
                    href="https://www.cliqtree.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    www.cliqtree.com
                  </a>
                </li>
              </ul>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-muted-foreground text-center">
              Esta política está em conformidade com a Lei Geral de Proteção de
              Dados (LGPD) do Brasil.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
