"use client";

import { InfinitePayIcon } from "@/components/icons/infinite-pay-icon";

interface InfinitePayCardProps {
  tag: string;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSave: () => void;
  onRemove: () => void;
  onSwitch: () => void;
  isSavedToBackend: boolean;
  isConfigured: boolean;
  isLoading: boolean;
}

export function InfinitePayCard({
  tag,
  inputValue,
  onInputChange,
  onSave,
  onRemove,
  onSwitch,
  isSavedToBackend,
  isConfigured,
  isLoading,
}: InfinitePayCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00c853]/10 flex items-center justify-center flex-shrink-0">
            <InfinitePayIcon />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">InfinitePay</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isConfigured
                ? "Seu link de pagamento está configurado."
                : "Configure seu identificador para gerar links de pagamento."}
            </p>
          </div>
        </div>
        {isSavedToBackend && (
          <button
            onClick={onSwitch}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Trocar ↔
          </button>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        {isConfigured ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-foreground">
                Tag:{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded">{tag}</code>
              </span>
            </div>
            <button
              onClick={onRemove}
              disabled={isLoading}
              className="text-sm text-destructive hover:underline disabled:opacity-50"
            >
              Remover
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Tag do comerciante (handle)
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="seu-negocio"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00c853]/50"
              />
            </div>
            <button
              onClick={onSave}
              disabled={isLoading || !inputValue.trim()}
              className="w-full py-2.5 bg-[#00c853] text-white rounded-lg font-medium hover:bg-[#00b348] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Salvando..." : "Salvar Configuração"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
