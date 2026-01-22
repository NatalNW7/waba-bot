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
  type BusinessInfo,
} from "./components";

type OnboardingStep = "business" | "email" | "plan" | "confirmation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STEPS: OnboardingStep[] = ["business", "email", "plan", "confirmation"];

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
  const handleConfirmation = async () => {
    if (!selectedPlan || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await onboardTenant({
        name: businessInfo.name,
        email: user.email,
        phone: sanitizePhone(businessInfo.phone),
        saasPlanId: selectedPlan.id,
      });

      if (result.subscription?.initPoint) {
        window.location.href = result.subscription.initPoint;
      }
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
                setStep("confirmation");
              }}
              onBack={() => setStep(isEmailVerified ? "business" : "email")}
            />
          )}

          {step === "confirmation" && selectedPlan && user && (
            <ConfirmationStep
              businessInfo={businessInfo}
              selectedPlan={selectedPlan}
              email={user.email}
              isSubmitting={isSubmitting}
              error={error}
              onConfirm={handleConfirmation}
              onBack={() => setStep("plan")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
