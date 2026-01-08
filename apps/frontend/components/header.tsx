import Link from "next/link"
import Image from "next/image"
import { Mail, Globe } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Contact info bar */}
        <div className="flex items-center justify-end gap-6 py-2 text-sm text-muted-foreground border-b border-border">
          <a
            href="mailto:cliqtreeoficial@gmail.com"
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">cliqtreeoficial@gmail.com</span>
          </a>
          <a
            href="https://www.cliqtree.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-foreground transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">www.cliqtree.com</span>
          </a>
        </div>

        {/* Main navigation */}
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/cliqtree-logo.png"
              alt="Cliqtree"
              width={140}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#home" className="text-sm font-medium hover:text-primary transition-colors">
              Início
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
              Como Funciona
            </Link>
            <Link href="/#benefits" className="text-sm font-medium hover:text-primary transition-colors">
              Benefícios
            </Link>
            {/* <Link href="/#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Preços
            </Link> */}
            <Link href="/#contact" className="text-sm font-medium hover:text-primary transition-colors">
              Contato
            </Link>
          </nav>

          <a
            href="https://wa.me/5511913339320?text=Olá!%20Gostaria%20de%20saber%20mais%20sobre%20o%20Cliqtree"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-whatsapp-dark transition-colors"
          >
            Agendar via WhatsApp
          </a>
        </div>
      </div>
    </header>
  )
}
