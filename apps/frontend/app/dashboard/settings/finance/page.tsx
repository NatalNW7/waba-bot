"use client";

import { useState } from "react";
import { useCurrentTenant, useUpdateTenant, usePayments } from "@/lib/hooks";
import {
  SubscriptionStatus,
  subscriptionStatusColors,
  paymentIntervalLabels,
  PaymentProvider,
} from "@/lib/dashboard/types";
import type { DashboardTenant, DashboardPayment } from "@/lib/dashboard/types";

// Import extracted components
import { ProviderSelectionCard } from "./components/provider-selection-card";
import { MercadoPagoCard } from "./components/mercado-pago-card";
import { InfinitePayCard } from "./components/infinite-pay-card";
import { PaymentHistoryTable } from "./components/payment-history-table";
import { ConfirmSwitchModal } from "./components/confirm-switch-modal";

export default function FinanceSettingsPage() {
  // Fetch data using React Query
  const { data: tenantData, isLoading: tenantLoading } = useCurrentTenant();
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments();
  const updateTenant = useUpdateTenant();

  const tenant = (tenantData as DashboardTenant) || null;
  const payments = (paymentsData as DashboardPayment[]) || [];
  const isLoading = tenantLoading || paymentsLoading;

  // Local state for UI flow
  const [infinitePayTag, setInfinitePayTag] = useState("");
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const [pendingProvider, setPendingProvider] =
    useState<PaymentProvider | null>(null);
  // Local state for selected provider (before saving to backend)
  const [selectedProvider, setSelectedProvider] =
    useState<PaymentProvider | null>(null);

  const hasMercadoPago = !!tenant?.mpAccessToken;
  const hasInfinitePayTag = !!tenant?.infinitePayTag;
  // Use local selection if set, otherwise use saved preference from backend
  const preferredProvider =
    selectedProvider ?? tenant?.preferredPaymentProvider ?? null;

  const statusLabels: Record<SubscriptionStatus, string> = {
    [SubscriptionStatus.ACTIVE]: "Ativa",
    [SubscriptionStatus.PAST_DUE]: "Pendente",
    [SubscriptionStatus.CANCELED]: "Cancelada",
    [SubscriptionStatus.EXPIRED]: "Expirada",
  };

  // Handle provider selection (local state only, no API call)
  const handleSelectProvider = (provider: PaymentProvider) => {
    setSelectedProvider(provider);
    // Reset tag input when switching
    setInfinitePayTag("");
  };

  // Handle switch provider request
  const handleSwitchRequest = (newProvider: PaymentProvider) => {
    setPendingProvider(newProvider);
    setShowSwitchConfirm(true);
  };

  // Confirm switch provider
  const handleConfirmSwitch = () => {
    if (!tenant || !pendingProvider) return;

    // Clear old credentials based on current provider
    const updates: Record<string, unknown> = {
      id: tenant.id,
      preferredPaymentProvider: pendingProvider,
    };

    if (preferredProvider === PaymentProvider.INFINITE_PAY) {
      updates.infinitePayTag = null;
    }
    // Note: MP tokens are handled via OAuth, not cleared here

    updateTenant.mutate(updates as Parameters<typeof updateTenant.mutate>[0]);
    setShowSwitchConfirm(false);
    setPendingProvider(null);
  };

  // Handle InfinitePay tag save (sends PATCH with provider + tag)
  const handleSaveInfinitePayTag = () => {
    if (!tenant || !infinitePayTag.trim()) return;

    updateTenant.mutate(
      {
        id: tenant.id,
        preferredPaymentProvider: PaymentProvider.INFINITE_PAY,
        infinitePayTag: infinitePayTag.trim(),
      },
      {
        onSuccess: () => {
          // Clear local selection after successful save
          setSelectedProvider(null);
        },
      },
    );
  };

  // Handle Mercado Pago selection save (just sets provider)
  const handleSaveMercadoPago = () => {
    if (!tenant) return;

    updateTenant.mutate(
      {
        id: tenant.id,
        preferredPaymentProvider: PaymentProvider.MERCADO_PAGO,
      },
      {
        onSuccess: () => {
          setSelectedProvider(null);
        },
      },
    );
  };

  // Handle remove InfinitePay config
  const handleRemoveInfinitePay = () => {
    if (!tenant) return;

    updateTenant.mutate({
      id: tenant.id,
      infinitePayTag: null,
      preferredPaymentProvider: null,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-5 w-64 bg-muted rounded mt-2 animate-pulse" />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-6 animate-pulse">
            <div className="h-32 bg-muted rounded" />
          </div>
          <div className="bg-card rounded-xl border border-border p-6 animate-pulse">
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Erro ao carregar dados do tenant
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas integrações de pagamento e assinatura
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payment Provider Section */}
        {!preferredProvider ? (
          // Stage 1: Provider Selection
          <ProviderSelectionCard
            onSelect={handleSelectProvider}
            isLoading={updateTenant.isPending}
          />
        ) : preferredProvider === PaymentProvider.MERCADO_PAGO ? (
          // Stage 2A: Mercado Pago Card
          <MercadoPagoCard
            isConnected={hasMercadoPago}
            isSavedToBackend={
              tenant.preferredPaymentProvider === PaymentProvider.MERCADO_PAGO
            }
            onSave={handleSaveMercadoPago}
            onSwitch={() => handleSwitchRequest(PaymentProvider.INFINITE_PAY)}
            isLoading={updateTenant.isPending}
          />
        ) : (
          // Stage 2B: InfinitePay Card
          <InfinitePayCard
            tag={tenant.infinitePayTag || ""}
            inputValue={infinitePayTag}
            onInputChange={setInfinitePayTag}
            onSave={handleSaveInfinitePayTag}
            onRemove={handleRemoveInfinitePay}
            onSwitch={() => handleSwitchRequest(PaymentProvider.MERCADO_PAGO)}
            isSavedToBackend={
              tenant.preferredPaymentProvider === PaymentProvider.INFINITE_PAY
            }
            isConfigured={hasInfinitePayTag}
            isLoading={updateTenant.isPending}
          />
        )}

        {/* SaaS Subscription Card */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Sua Assinatura</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Plano atual e status de pagamento
              </p>
            </div>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor:
                  subscriptionStatusColors[tenant.saasStatus] + "20",
                color: subscriptionStatusColors[tenant.saasStatus],
              }}
            >
              {statusLabels[tenant.saasStatus]}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Plano</span>
              <span className="font-semibold text-foreground">
                {tenant.saasPlan?.name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Valor</span>
              <span className="font-semibold text-foreground">
                R$ {tenant.saasPlan?.price}
                <span className="font-normal text-muted-foreground">
                  /
                  {paymentIntervalLabels[
                    tenant.saasPlan?.interval || "MONTHLY"
                  ].toLowerCase()}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Próxima cobrança</span>
              <span className="font-semibold text-foreground">
                {tenant.saasNextBilling
                  ? new Date(tenant.saasNextBilling).toLocaleDateString("pt-BR")
                  : "-"}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <button className="text-sm text-primary font-medium hover:underline">
              Alterar plano
            </button>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <PaymentHistoryTable payments={payments} />

      {/* Switch Provider Confirmation Modal */}
      {showSwitchConfirm && pendingProvider && (
        <ConfirmSwitchModal
          newProvider={pendingProvider}
          onConfirm={handleConfirmSwitch}
          onCancel={() => {
            setShowSwitchConfirm(false);
            setPendingProvider(null);
          }}
          isLoading={updateTenant.isPending}
        />
      )}
    </div>
  );
}
