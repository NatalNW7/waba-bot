"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (!isLoading && user?.onboardingStatus === "PENDING") {
      router.push("/onboarding");
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name || "Avatar"}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {user.name || "Bem-vindo!"}
              </h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-muted rounded-lg p-4 space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <span className="font-medium text-foreground capitalize">
                {user.role.toLowerCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span
                className={`font-medium ${user.onboardingStatus === "COMPLETE" ? "text-green-600" : "text-yellow-600"}`}
              >
                {user.onboardingStatus === "COMPLETE"
                  ? "Onboarding Completo"
                  : "Pendente"}
              </span>
            </div>
            {user.tenantId && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tenant ID:</span>
                <span className="font-mono text-sm text-foreground">
                  {user.tenantId}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full px-4 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors text-center"
            >
              Voltar ao início
            </Link>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 rounded-lg border border-destructive text-destructive font-medium hover:bg-destructive/10 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
