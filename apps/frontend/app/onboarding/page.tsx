"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getAuthToken } from "@/lib/auth";
import { type ISaasPlan } from "@repo/api-types";
import { sanitizePhone } from "@/lib/utils/phone-utils";
import { onboardTenant, getEmailStatus } from "@/lib/api/tenant";
import {
  OnboardingProgress,
  BusinessInfoStep,
  EmailVerificationStep,
  PlanSelectionStep,
  ConfirmationStep,
  PaymentStep,
  type BusinessInfo,
} from "./components";

type OnboardingStep =
  | "business"
  | "email"
  | "plan"
  | "payment"
  | "confirmation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STEPS: OnboardingStep[] = ["business", "email", "plan", "payment"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Step management
  const [step, setStep] = useState<OnboardingStep>("business");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  // Form state
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: "",
    phone: "",
  });
  const [selectedPlan, setSelectedPlan] = useState<ISaasPlan | null>(null);
  const [plans, setPlans] = useState<ISaasPlan[]>([]);

  // Submission state
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

  // Check email verification status on mount
  useEffect(() => {
    const checkEmailStatus = async () => {
      if (user) {
        try {
          const status = await getEmailStatus();
          setIsEmailVerified(status.emailVerified);
        } catch {
          // Default to not verified if check fails
          setIsEmailVerified(false);
        }
      }
    };
    checkEmailStatus();
  }, [user]);

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
          setPlans(data);
        }
      } catch {
        console.error("Failed to fetch plans");
      }
    };
    fetchPlans();
  }, []);

  // Handle business step submission - skip email step if already verified
  const handleBusinessSubmit = () => {
    if (isEmailVerified) {
      setStep("plan");
    } else {
      setStep("email");
    }
  };

  // Single consolidated request for onboarding
  const handlePaymentConfirm = async (
    cardTokenId: string,
    payerEmail: string,
  ) => {
    if (!selectedPlan || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onboardTenant({
        name: businessInfo.name,
        email: user.email,
        phone: sanitizePhone(businessInfo.phone),
        saasPlanId: selectedPlan.id,
        cardTokenId,
        payerEmail,
      });

      // Subscription is created with status: authorized, no redirect needed
      setStep("confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      setIsSubmitting(false);
    }
  };

  const getCurrentStepIndex = () => STEPS.indexOf(step);

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
        <OnboardingProgress
          steps={STEPS}
          currentStepIndex={getCurrentStepIndex()}
        />

        <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
          {step === "business" && (
            <BusinessInfoStep
              businessInfo={businessInfo}
              onBusinessInfoChange={setBusinessInfo}
              onSubmit={handleBusinessSubmit}
            />
          )}

          {step === "email" && user && (
            <EmailVerificationStep
              email={user.email}
              onVerified={() => setStep("plan")}
              onBack={() => setStep("business")}
            />
          )}

          {step === "plan" && (
            <PlanSelectionStep
              plans={plans}
              onPlanSelect={(plan) => {
                setSelectedPlan(plan);
                setStep("payment");
              }}
              onBack={() => setStep(isEmailVerified ? "business" : "email")}
            />
          )}

          {step === "payment" && selectedPlan && user && (
            <PaymentStep
              businessInfo={businessInfo}
              selectedPlan={selectedPlan}
              email={user.email}
              isSubmitting={isSubmitting}
              error={error}
              onConfirm={handlePaymentConfirm}
              onBack={() => setStep("plan")}
            />
          )}

          {step === "confirmation" && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Sua assinatura foi criada!
              </h2>
              <p className="text-muted-foreground mb-6">
                Sua conta foi ativada e o pagamento foi processado com sucesso.
              </p>
              <button
                onClick={() => router.push("/profile")}
                className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Acessar o Painel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
