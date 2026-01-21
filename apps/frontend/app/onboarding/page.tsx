"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getAuthToken } from "@/lib/auth";
import { type ISaasPlan, PaymentInterval } from "@repo/api-types";
import { BrazilianPhoneInput } from "@/components/ui/brazilian-phone-input";
import { sanitizePhone } from "@/lib/utils/phone-utils";
import {
  onboardTenant,
  sendVerificationEmail,
  verifyEmail,
} from "@/lib/api/tenant";

type OnboardingStep = "business" | "email" | "plan" | "confirmation";

interface BusinessInfo {
  name: string;
  phone: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
const STEPS: OnboardingStep[] = ["business", "email", "plan", "confirmation"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [step, setStep] = useState<OnboardingStep>("business");
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: "",
    phone: "",
  });
  const [selectedPlan, setSelectedPlan] = useState<ISaasPlan | null>(null);
  const [plans, setPlans] = useState<ISaasPlan[]>([]);
  const [selectedInterval, setSelectedInterval] = useState<PaymentInterval>(
    PaymentInterval.MONTHLY,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email verification state
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(6).fill(""),
  );
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
          setPlans(data);
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
      setStep("email");
    }
  };

  // Send verification email
  const handleSendVerificationCode = async () => {
    setIsSendingCode(true);
    setError(null);
    try {
      await sendVerificationEmail();
      setCodeSent(true);
      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar código");
    } finally {
      setIsSendingCode(false);
    }
  };

  // Handle code input
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...verificationCode];
    newCode[index] = value.slice(-1); // Only take last digit
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newCode = [...verificationCode];
      pastedData.split("").forEach((char, i) => {
        if (i < 6) newCode[i] = char;
      });
      setVerificationCode(newCode);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  // Verify email code
  const handleVerifyCode = async () => {
    const code = verificationCode.join("");
    if (code.length !== 6) {
      setError("Digite o código de 6 dígitos");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await verifyEmail(code);
      if (result.verified) {
        setIsEmailVerified(true);
        setStep("plan");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlanSelect = (plan: ISaasPlan) => {
    setSelectedPlan(plan);
    setStep("confirmation");
  };

  // Single consolidated request for onboarding
  const handleConfirmation = async () => {
    if (!selectedPlan || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Single consolidated request - creates tenant AND subscription
      const result = await onboardTenant({
        name: businessInfo.name,
        email: user.email,
        phone: sanitizePhone(businessInfo.phone),
        saasPlanId: selectedPlan.id,
      });

      // Redirect to Mercado Pago payment page
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
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    getCurrentStepIndex() >= i
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 ml-2 transition-colors ${
                      getCurrentStepIndex() > i ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
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
                  <BrazilianPhoneInput
                    value={businessInfo.phone}
                    onChange={(phone) =>
                      setBusinessInfo({
                        ...businessInfo,
                        phone: phone,
                      })
                    }
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

          {/* Step 2: Email Verification */}
          {step === "email" && (
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Verificar seu email
              </h1>
              <p className="text-muted-foreground mb-6">
                Enviaremos um código de verificação para{" "}
                <span className="font-medium text-foreground">
                  {user?.email}
                </span>
              </p>

              {!codeSent ? (
                <button
                  onClick={handleSendVerificationCode}
                  disabled={isSendingCode}
                  className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSendingCode ? "Enviando..." : "Enviar código de verificação"}
                </button>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3 text-center">
                      Digite o código de 6 dígitos
                    </label>
                    <div
                      className="flex justify-center gap-2"
                      onPaste={handleCodePaste}
                    >
                      {verificationCode.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => {
                            inputRefs.current[index] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) =>
                            handleCodeChange(index, e.target.value)
                          }
                          onKeyDown={(e) => handleCodeKeyDown(index, e)}
                          className="w-12 h-14 text-center text-xl font-bold rounded-lg border border-input bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      ))}
                    </div>
                  </div>

                  {error && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-center">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleVerifyCode}
                    disabled={
                      isSubmitting || verificationCode.join("").length !== 6
                    }
                    className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Verificando..." : "Verificar"}
                  </button>

                  <button
                    onClick={handleSendVerificationCode}
                    disabled={isSendingCode}
                    className="w-full text-sm text-muted-foreground hover:text-foreground"
                  >
                    {isSendingCode ? "Enviando..." : "Reenviar código"}
                  </button>
                </div>
              )}

              <button
                onClick={() => setStep("business")}
                className="w-full mt-4 px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* Step 3: Plan Selection */}
          {step === "plan" && (
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Escolha seu plano
              </h1>
              <p className="text-muted-foreground mb-6">
                Selecione o plano que melhor atende às necessidades do seu
                negócio.
              </p>

              {/* Interval Tabs */}
              <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
                {[
                  { value: PaymentInterval.MONTHLY, label: "Mensal" },
                  { value: PaymentInterval.QUARTERLY, label: "Trimestral" },
                  { value: PaymentInterval.YEARLY, label: "Anual" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setSelectedInterval(tab.value)}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      selectedInterval === tab.value
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    {tab.value === PaymentInterval.YEARLY && (
                      <span className="ml-1 text-xs text-primary">
                        Economia!
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Plan Cards */}
              <div className="grid gap-4">
                {plans
                  .filter((plan) => plan.interval === selectedInterval)
                  .map((plan) => (
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
                            /
                            {selectedInterval === PaymentInterval.MONTHLY
                              ? "mês"
                              : selectedInterval === PaymentInterval.QUARTERLY
                                ? "trimestre"
                                : "ano"}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                {plans.filter((plan) => plan.interval === selectedInterval)
                  .length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum plano disponível neste período.
                  </div>
                )}
              </div>

              <button
                onClick={() => setStep("email")}
                className="w-full mt-4 px-4 py-2 text-muted-foreground hover:text-foreground"
              >
                ← Voltar
              </button>
            </div>
          )}

          {/* Step 4: Confirmation */}
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
                    <span className="ml-2 text-xs text-primary">✓ Verificado</span>
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
