"use client";

import { useState } from "react";
import { sendVerificationEmail, verifyEmail } from "@/lib/api/tenant";
import { useVerificationCode } from "../hooks/useVerificationCode";

interface EmailVerificationStepProps {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

export function EmailVerificationStep({
  email,
  onVerified,
  onBack,
}: EmailVerificationStepProps) {
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    code,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,
    isComplete,
    getCode,
  } = useVerificationCode();

  const handleSendCode = async () => {
    setIsSendingCode(true);
    setError(null);
    try {
      await sendVerificationEmail();
      setCodeSent(true);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar código");
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleVerify = async () => {
    if (!isComplete) {
      setError("Digite o código de 6 dígitos");
      return;
    }

    setIsVerifying(true);
    setError(null);
    try {
      const result = await verifyEmail(getCode());
      if (result.verified) {
        onVerified();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-2">
        Verificar seu email
      </h1>
      <p className="text-muted-foreground mb-6">
        Enviaremos um código de verificação para{" "}
        <span className="font-medium text-foreground">{email}</span>
      </p>

      {!codeSent ? (
        <button
          onClick={handleSendCode}
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
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
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
            onClick={handleVerify}
            disabled={isVerifying || !isComplete}
            className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isVerifying ? "Verificando..." : "Verificar"}
          </button>

          <button
            onClick={handleSendCode}
            disabled={isSendingCode}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            {isSendingCode ? "Enviando..." : "Reenviar código"}
          </button>
        </div>
      )}

      <button
        onClick={onBack}
        className="w-full mt-4 px-4 py-2 text-muted-foreground hover:text-foreground"
      >
        ← Voltar
      </button>
    </div>
  );
}
