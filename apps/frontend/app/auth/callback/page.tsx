"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { XIcon } from "@/components/ui/icons";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasAttemptedLogin = useState(false)[0];

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      // Use setTimeout to avoid setState during render
      setTimeout(() => setError("Token de autenticação não encontrado"), 0);
      return;
    }

    if (hasAttemptedLogin) return;

    const handleLogin = async () => {
      try {
        await login(token);
      } catch {
        setError("Falha na autenticação. Tente novamente.");
      }
    };

    handleLogin();
  }, [searchParams, login, hasAttemptedLogin]);

  // Redirect based on onboarding status once we have the user
  useEffect(() => {
    if (user && !isLoading) {
      if (user.onboardingStatus === "PENDING") {
        router.push("/onboarding");
      } else {
        router.push("/profile");
      }
    }
  }, [user, isLoading, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <XIcon className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Erro na autenticação
          </h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <a
            href="/login"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Voltar ao login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Autenticando...
        </h1>
        <p className="text-muted-foreground">
          Aguarde enquanto verificamos sua identidade
        </p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-foreground mb-2">
          Carregando...
        </h1>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
