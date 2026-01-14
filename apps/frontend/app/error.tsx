"use client";

import { useEffect } from "react";
import Link from "next/link";
import { WarningIcon, RefreshIcon, HomeIcon } from "@/components/ui/icons";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          {/* Error Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-6 animate-pulse">
            <WarningIcon className="w-10 h-10 text-destructive" />
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Ops! Algo deu errado
          </h1>
          <p className="text-muted-foreground mb-6">
            Não foi possível carregar esta página. Isso pode ser um problema
            temporário de conexão com o servidor.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => reset()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <RefreshIcon className="w-5 h-5" />
              Tentar novamente
            </button>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <HomeIcon className="w-5 h-5" />
              Voltar ao início
            </Link>
          </div>

          {/* Technical Details (collapsible) */}
          {error.digest && (
            <details className="mt-6 text-left">
              <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                Detalhes técnicos
              </summary>
              <div className="mt-2 p-3 rounded-lg bg-muted text-xs font-mono text-muted-foreground break-all">
                <p>
                  <strong>Error ID:</strong> {error.digest}
                </p>
                <p className="mt-1">
                  <strong>Message:</strong> {error.message}
                </p>
              </div>
            </details>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Se o problema persistir, entre em contato com o suporte.
        </p>
      </div>
    </div>
  );
}
