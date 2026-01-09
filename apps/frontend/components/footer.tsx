import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Globe,
  MessageCircle,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";

export function Footer() {
  return (
    <footer id="contact" className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Image
              src="/images/cliqtree-logo.png"
              alt="Cliqtree"
              width={140}
              height={48}
              className="h-12 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-background/70 mb-6 leading-relaxed max-w-md">
              Assistente de agendamento automatizado via WhatsApp para salões de
              beleza e barbearias. Economize tempo, aumente agendamentos e
              reduza faltas.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/cliqtree/"
                className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/cliqtreeoficial/"
                className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              {/* 
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-background/10 hover:bg-background/20 flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/#home"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link
                  href="/#benefits"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Benefícios
                </Link>
              </li>
              {/* <li>
                <Link href="/#pricing" className="text-background/70 hover:text-background transition-colors">
                  Preços
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contato</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:cliqtreeoficial@gmail.com"
                  className="flex items-center gap-2 text-background/70 hover:text-background transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>cliqtreeoficial@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="https://www.cliqtree.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-background/70 hover:text-background transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span>www.cliqtree.com</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="border-t border-background/20 pt-12 mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Pronto para automatizar seus agendamentos?
            </h3>
            <p className="text-background/70 mb-6">
              Comece seu teste grátis hoje e veja a diferença
            </p>
            <a
              href="https://wa.me/5511913339320?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20Cliqtree"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-whatsapp-dark transition-all hover:scale-105"
            >
              <MessageCircle className="w-5 h-5" />
              Começar a agendar no WhatsApp
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-background/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-background/60">
          <p>&copy; 2025 Cliqtree. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/politica-de-privacidade"
              className="hover:text-background transition-colors"
            >
              Política de Privacidade
            </Link>
            <Link
              href="/termos-de-servico"
              className="hover:text-background transition-colors"
            >
              Termos de Serviço
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
