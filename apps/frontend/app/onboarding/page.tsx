"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getAuthToken } from "@/lib/auth";
import type { ISaasPlan } from "@repo/api-types";

type OnboardingStep = "business" | "plan" | "confirmation";

interface BusinessInfo {
  name: string;
  phone: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading, refreshSession } = useAuth();
  const [step, setStep] = useState<OnboardingStep>("business");
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: "",
    phone: "",
  });
  const [selectedPlan, setSelectedPlan] = useState<ISaasPlan | null>(null);
  const [plans, setPlans] = useState<ISaasPlan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated or already onboarded
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    } else if (!isLoading && user?.onboardingStatus === "COMPLETE") {
      router.push("/profile");
    }
  }, [user, isLoading, router]);

  // Fetch SaaS plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${BACKEND_URL}/saas-plans`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = (await response.json()) as ISaasPlan[];
          // Filter to show only MONTHLY plans for simplicity
          const monthlyPlans = data.filter((p) => p.interval === "MONTHLY");
          setPlans(monthlyPlans);
        }
      } catch {
        console.error("Failed to fetch plans");
      }
    };
    fetchPlans();
  }, []);

  const handleBusinessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessInfo.name && businessInfo.phone) {
      setStep("plan");
    }
  };

  const handlePlanSelect = (plan: ISaasPlan) => {
    setSelectedPlan(plan);
    setStep("confirmation");
  };

  const handleConfirmation = async () => {
    if (!selectedPlan || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const token = getAuthToken();

      // Create tenant
      const tenantResponse = await fetch(`${BACKEND_URL}/tenants`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: businessInfo.name,
          email: user.email,
          phone: businessInfo.phone,
          saasPlanId: selectedPlan.id,
        }),
      });

      if (!tenantResponse.ok) {
        throw new Error("Falha ao criar seu negócio");
      }

      // Refresh session to get updated onboarding status
      await refreshSession();
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {["business", "plan", "confirmation"].map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === s ||
                    ["plan", "confirmation"].indexOf(step) >
                      ["business", "plan", "confirmation"].indexOf(s)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                {i < 2 && <div className="w-12 h-0.5 bg-muted ml-2" />}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          {/* Step 1: Business Info */}
          {step === "business" && (
            <form onSubmit={handleBusinessSubmit}>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Conte-nos sobre seu negócio
              </h1>
              <p className="text-muted-foreground mb-6">
                Essas informações serão usadas para criar seu perfil comercial.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Nome do negócio
                  </label>
                  <input
                    type="text"
                    value={businessInfo.name}
                    onChange={(e) =>
                      setBusinessInfo({ ...businessInfo, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: Barbearia do João"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={businessInfo.phone}
                    onChange={(e) =>
                      setBusinessInfo({
                        ...businessInfo,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+55 11 99999-9999"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Continuar
              </button>
            </form>
          )}

          {/* Step 2: Plan Selection */}
          {step === "plan" && (
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Escolha seu plano
              </h1>
              <p className="text-muted-foreground mb-6">
                Selecione o plano que melhor atende às necessidades do seu
                negócio.
              </p>

              <div className="grid gap-4">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan)}
                    className="p-4 rounded-lg border border-border hover:border-primary text-left transition-colors group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {plan.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">
                          R$ {Number(plan.price).toFixed(0)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          /mês
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep("business")}
                className="w-full mt-4 px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === "confirmation" && selectedPlan && (
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Confirme seus dados
              </h1>
              <p className="text-muted-foreground mb-6">
                Revise as informações antes de criar sua conta.
              </p>

              <div className="bg-muted rounded-lg p-4 space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Negócio:</span>
                  <span className="font-medium text-foreground">
                    {businessInfo.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefone:</span>
                  <span className="font-medium text-foreground">
                    {businessInfo.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground">
                    {user?.email}
                  </span>
                </div>
                <hr className="border-border" />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plano:</span>
                  <span className="font-medium text-foreground">
                    {selectedPlan.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor:</span>
                  <span className="font-bold text-primary">
                    R$ {Number(selectedPlan.price).toFixed(2)}/mês
                  </span>
                </div>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={handleConfirmation}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Criando..." : "Criar meu negócio"}
              </button>

              <button
                onClick={() => setStep("plan")}
                disabled={isSubmitting}
                className="w-full mt-4 px-4 py-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                ← Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
