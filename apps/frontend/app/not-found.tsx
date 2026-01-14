"use client";

import Link from "next/link";
import { HomeIcon, ArrowLeftIcon } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          {/* 404 Display */}
          <div className="mb-6">
            <h1 className="text-8xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
              404
            </h1>
          </div>

          {/* Message */}
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Página não encontrada
          </h2>
          <p className="text-muted-foreground mb-6">
            A página que você está procurando não existe ou foi movida para
            outro endereço.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              Voltar ao início
            </Link>

            <button
              onClick={() => history.back()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              Voltar para a página anterior
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2026 Cliqtree. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
