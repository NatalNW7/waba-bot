"use client";

import { useState, useRef, useCallback } from "react";

interface UseVerificationCodeReturn {
  code: string[];
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  handleChange: (index: number, value: string) => void;
  handleKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  handlePaste: (e: React.ClipboardEvent) => void;
  reset: () => void;
  isComplete: boolean;
  getCode: () => string;
}

const CODE_LENGTH = 6;

export function useVerificationCode(): UseVerificationCodeReturn {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback((index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take last digit
    setCode(newCode);

    // Auto-focus next input
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [code]);

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [code]
  );

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, CODE_LENGTH);
    
    if (/^\d+$/.test(pastedData)) {
      const newCode = Array(CODE_LENGTH).fill("");
      pastedData.split("").forEach((char, i) => {
        if (i < CODE_LENGTH) newCode[i] = char;
      });
      setCode(newCode);
      inputRefs.current[Math.min(pastedData.length, CODE_LENGTH - 1)]?.focus();
    }
  }, []);

  const reset = useCallback(() => {
    setCode(Array(CODE_LENGTH).fill(""));
  }, []);

  const isComplete = code.every((digit) => digit !== "");
  const getCode = useCallback(() => code.join(""), [code]);

  return {
    code,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,
    reset,
    isComplete,
    getCode,
  };
}
