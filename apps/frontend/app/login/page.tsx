"use client";

import { authStrategies } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md p-8">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Bem-vindo ao Cliqtree
            </h1>
            <p className="text-muted-foreground mt-2">
              Faça login para gerenciar seu negócio
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            {authStrategies.map((strategy) => (
              <button
                key={strategy.name}
                onClick={strategy.login}
                className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  strategy.color ||
                  "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                }`}
              >
                {strategy.icon}
                <span>Continuar com {strategy.name}</span>
              </button>
            ))}
          </div>

          {/* Terms */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Ao continuar, você concorda com nossos{" "}
            <a
              href="/termos-de-servico"
              className="text-primary hover:underline"
            >
              Termos de Serviço
            </a>{" "}
            e{" "}
            <a
              href="/politica-de-privacidade"
              className="text-primary hover:underline"
            >
              Política de Privacidade
            </a>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2026 Cliqtree. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
