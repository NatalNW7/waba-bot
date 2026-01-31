"use client";

import { useState, useMemo } from "react";
import { useCustomers, usePlans } from "@/lib/hooks";
import type { DashboardCustomer, DashboardPlan } from "@/lib/dashboard/types";
import { SubscriptionStatus } from "@/lib/dashboard/types";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";

type StatusFilter = "all" | "subscriber" | "past_due" | "canceled" | "walkin";

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedCustomer, setSelectedCustomer] =
    useState<DashboardCustomer | null>(null);

  // Fetch data using React Query
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: plansData, isLoading: plansLoading } = usePlans();

  const customers = useMemo(
    () => (customersData as DashboardCustomer[]) || [],
    [customersData],
  );
  const plans = useMemo(
    () => (plansData as DashboardPlan[]) || [],
    [plansData],
  );
  const isLoading = customersLoading || plansLoading;

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // Search filter
      const matchesSearch =
        customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      let matchesStatus = true;
      if (statusFilter !== "all") {
        const subStatus = customer.tenantCustomer?.subscription?.status;
        switch (statusFilter) {
          case "subscriber":
            matchesStatus = subStatus === SubscriptionStatus.ACTIVE;
            break;
          case "past_due":
            matchesStatus = subStatus === SubscriptionStatus.PAST_DUE;
            break;
          case "canceled":
            matchesStatus =
              subStatus === SubscriptionStatus.CANCELED ||
              subStatus === SubscriptionStatus.EXPIRED;
            break;
          case "walkin":
            matchesStatus = !customer.tenantCustomer?.subscription;
            break;
        }
      }

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(
    () => ({
      total: customers.length,
      active: customers.filter(
        (c) =>
          c.tenantCustomer?.subscription?.status === SubscriptionStatus.ACTIVE,
      ).length,
      pastDue: customers.filter(
        (c) =>
          c.tenantCustomer?.subscription?.status ===
          SubscriptionStatus.PAST_DUE,
      ).length,
      walkin: customers.filter((c) => !c.tenantCustomer?.subscription).length,
    }),
    [customers],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus clientes e assinaturas
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Novo Cliente
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total de Clientes"
          value={stats.total}
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          label="Assinantes Ativos"
          value={stats.active}
          color="green"
          isLoading={isLoading}
        />
        <StatCard
          label="Inadimplentes"
          value={stats.pastDue}
          color="yellow"
          isLoading={isLoading}
        />
        <StatCard
          label="Avulsos"
          value={stats.walkin}
          color="gray"
          isLoading={isLoading}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="all">Todos os status</option>
          <option value="subscriber">Assinantes Ativos</option>
          <option value="past_due">Inadimplentes</option>
          <option value="canceled">Cancelados</option>
          <option value="walkin">Avulsos</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Mobile: Card view */}
        <div className="sm:hidden divide-y divide-border">
          {filteredCustomers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhum cliente encontrado
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-medium text-primary">
                        {customer.name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {customer.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customer.phone}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    status={customer.statusLabel}
                    color={customer.statusColor}
                  />
                </div>
                {customer.tenantCustomer?.subscription && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Próxima fatura:
                    </span>
                    <span className="text-foreground">
                      {new Date(
                        customer.tenantCustomer.subscription.nextBilling,
                      ).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => setSelectedCustomer(customer)}
                  className="w-full py-2 text-sm text-primary font-medium border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  Gerenciar
                </button>
              </div>
            ))
          )}
        </div>

        {/* Desktop: Table view */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Cliente
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Telefone
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Plano
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Próx. Fatura
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Nenhum cliente encontrado
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-primary">
                            {customer.name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {customer.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {customer.phone}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={customer.statusLabel}
                        color={customer.statusColor}
                      />
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {customer.tenantCustomer?.subscription?.plan?.name || "-"}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {customer.tenantCustomer?.subscription
                        ? new Date(
                            customer.tenantCustomer.subscription.nextBilling,
                          ).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="px-3 py-1.5 text-sm text-primary font-medium border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Management Modal */}
      {selectedCustomer && (
        <CustomerModal
          customer={selectedCustomer}
          plans={plans}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
}

function CustomerModal({
  customer,
  plans,
  onClose,
}: {
  customer: DashboardCustomer;
  plans: DashboardPlan[];
  onClose: () => void;
}) {
  const [selectedPlanId, setSelectedPlanId] = useState(
    customer.tenantCustomer?.subscription?.planId || "",
  );

  const hasSubscription = !!customer.tenantCustomer?.subscription;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-card rounded-2xl shadow-xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            Gerenciar Cliente
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors"
            aria-label="Fechar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Customer info */}
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">
                {customer.name?.charAt(0) || "?"}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">
                {customer.name}
              </h3>
              <p className="text-muted-foreground">{customer.phone}</p>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge
              status={customer.statusLabel}
              color={customer.statusColor}
            />
            {hasSubscription && (
              <span className="text-sm text-muted-foreground">
                desde{" "}
                {new Date(
                  customer.tenantCustomer!.subscription!.startDate,
                ).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>

          {/* Subscription management */}
          <div className="pt-4 border-t border-border space-y-4">
            <h4 className="font-medium text-foreground">
              {hasSubscription ? "Alterar Plano" : "Criar Assinatura"}
            </h4>

            <div className="space-y-2">
              {plans.map((plan) => (
                <label
                  key={plan.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPlanId === plan.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="plan"
                    value={plan.id}
                    checked={selectedPlanId === plan.id}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      selectedPlanId === plan.id
                        ? "border-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {selectedPlanId === plan.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{plan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {plan.maxAppointmentsLabel} • {plan.intervalLabel}
                    </p>
                  </div>
                  <p className="font-bold text-foreground">R$ {plan.price}</p>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-border rounded-lg text-foreground font-medium hover:bg-muted transition-colors"
          >
            Cancelar
          </button>
          <button className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            {hasSubscription ? "Atualizar Plano" : "Criar Assinatura"}
          </button>
        </div>
      </div>
    </>
  );
}
