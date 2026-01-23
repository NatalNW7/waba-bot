"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/lib/auth";
import { ReactQueryProvider } from "@/components/providers/react-query-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </ReactQueryProvider>
  );
}
