"use client";

import { useState } from "react";
import {
  useServices,
  usePlans,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
} from "@/lib/hooks";
import type { DashboardService, DashboardPlan } from "@/lib/dashboard/types";
import { PaymentInterval } from "@repo/api-types";

type Tab = "services" | "plans";

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<Tab>("services");
  const [editingService, setEditingService] = useState<DashboardService | null>(
    null,
  );
  const [editingPlan, setEditingPlan] = useState<DashboardPlan | null>(null);
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [showNewPlanModal, setShowNewPlanModal] = useState(false);

  // Fetch data using React Query
  const { data: servicesData, isLoading: servicesLoading } = useServices();
  const { data: plansData, isLoading: plansLoading } = usePlans();

  const services = (servicesData as DashboardService[]) || [];
  const plans = (plansData as DashboardPlan[]) || [];
  const isLoading = servicesLoading || plansLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Catálogo</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus serviços e planos de assinatura
          </p>
        </div>
        <button
          onClick={() =>
            activeTab === "services"
              ? setShowNewServiceModal(true)
              : setShowNewPlanModal(true)
          }
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Novo {activeTab === "services" ? "Serviço" : "Plano"}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("services")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "services"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Serviços ({isLoading ? "..." : services.length})
          </button>
          <button
            onClick={() => setActiveTab("plans")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "plans"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Planos ({isLoading ? "..." : plans.length})
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "services" ? (
        <ServicesTab
          services={services}
          onEdit={setEditingService}
          isLoading={servicesLoading}
        />
      ) : (
        <PlansTab
          plans={plans}
          onEdit={setEditingPlan}
          isLoading={plansLoading}
        />
      )}

      {/* Modals */}
      {(editingService || showNewServiceModal) && (
        <ServiceModal
          service={editingService}
          onClose={() => {
            setEditingService(null);
            setShowNewServiceModal(false);
          }}
        />
      )}

      {(editingPlan || showNewPlanModal) && (
        <PlanModal
          plan={editingPlan}
          onClose={() => {
            setEditingPlan(null);
            setShowNewPlanModal(false);
          }}
        />
      )}
    </div>
  );
}

function ServicesTab({
  services,
  onEdit,
  isLoading = false,
}: {
  services: DashboardService[];
  onEdit: (service: DashboardService) => void;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-border p-4 animate-pulse"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="h-5 w-32 bg-muted rounded mb-2" />
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
            </div>
            <div className="h-8 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <div
          key={service.id}
          className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-foreground">{service.name}</h3>
              <p className="text-sm text-muted-foreground">
                {service.duration} minutos
              </p>
            </div>
            <button
              onClick={() => onEdit(service)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Editar"
            >
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-foreground">
              R$ {service.price}
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {service.duration}min
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PlansTab({
  plans,
  onEdit,
  isLoading = false,
}: {
  plans: DashboardPlan[];
  onEdit: (plan: DashboardPlan) => void;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-border p-4 animate-pulse"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="h-5 w-32 bg-muted rounded mb-2" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            </div>
            <div className="h-8 w-24 bg-muted rounded mb-3" />
            <div className="h-4 w-full bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-foreground">{plan.name}</h3>
              <span className="inline-flex px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                {plan.intervalLabel}
              </span>
            </div>
            <button
              onClick={() => onEdit(plan)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Editar"
            >
              <svg
                className="w-4 h-4 text-muted-foreground"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>

          {plan.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {plan.description}
            </p>
          )}

          <div className="flex items-end justify-between mb-3">
            <p className="text-2xl font-bold text-foreground">
              R$ {plan.price}
            </p>
            <p className="text-sm text-muted-foreground">
              /{plan.intervalLabel.toLowerCase()}
            </p>
          </div>

          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-muted-foreground">
                {plan.maxAppointmentsLabel}
              </span>
            </div>
            {plan.services && plan.services.length > 0 && (
              <div className="flex items-center gap-2 text-sm mt-1">
                <svg
                  className="w-4 h-4 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-muted-foreground">
                  {plan.services.length} serviço
                  {plan.services.length > 1 ? "s" : ""} incluído
                  {plan.services.length > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ServiceModal({
  service,
  onClose,
}: {
  service: DashboardService | null;
  onClose: () => void;
}) {
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const deleteMutation = useDeleteService();

  const isEdit = !!service;
  const [name, setName] = useState(service?.name || "");
  const [price, setPrice] = useState(service?.price.toString() || "");
  const [duration, setDuration] = useState(
    service?.duration.toString() || "30",
  );

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const handleSubmit = () => {
    const data = {
      name,
      price: parseFloat(price),
      duration: parseInt(duration),
    };

    if (isEdit && service) {
      updateMutation.mutate(
        { id: service.id, data },
        {
          onSuccess: () => onClose(),
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => onClose(),
      });
    }
  };

  const handleDelete = () => {
    if (service && confirm("Tem certeza que deseja excluir este serviço?")) {
      deleteMutation.mutate(service.id, {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl shadow-xl z-50 overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Editar Serviço" : "Novo Serviço"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors"
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

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Corte Feminino"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Preço (R$)
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="80.00"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Duração (min)
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 hora</option>
                <option value="90">1h30</option>
                <option value="120">2 horas</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          {isEdit && (
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2.5 text-destructive font-medium hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 border border-border rounded-lg text-foreground font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !name || !price}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Salvando..."
              : isEdit
                ? "Salvar"
                : "Criar"}
          </button>
        </div>
      </div>
    </>
  );
}

function PlanModal({
  plan,
  onClose,
}: {
  plan: DashboardPlan | null;
  onClose: () => void;
}) {
  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan();
  const deleteMutation = useDeletePlan();

  const isEdit = !!plan;
  const [name, setName] = useState(plan?.name || "");
  const [description, setDescription] = useState(plan?.description || "");
  const [price, setPrice] = useState(plan?.price.toString() || "");
  const [interval, setInterval] = useState(plan?.interval || "MONTHLY");
  const [maxAppointments, setMaxAppointments] = useState(
    plan?.maxAppointments.toString() || "-1",
  );

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const handleSubmit = () => {
    const data = {
      name,
      description,
      price: parseFloat(price),
      interval: interval as PaymentInterval,
      maxAppointments: parseInt(maxAppointments),
    };

    if (isEdit && plan) {
      updateMutation.mutate(
        { id: plan.id, data },
        {
          onSuccess: () => onClose(),
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => onClose(),
      });
    }
  };

  const handleDelete = () => {
    if (plan && confirm("Tem certeza que deseja excluir este plano?")) {
      deleteMutation.mutate(plan.id, {
        onSuccess: () => onClose(),
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl shadow-xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {isEdit ? "Editar Plano" : "Novo Plano"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors"
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

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Plano Premium"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva os benefícios do plano..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Preço (R$)
              </label>
              <input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="99.00"
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Intervalo
              </label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="MONTHLY">Mensal</option>
                <option value="QUARTERLY">Trimestral</option>
                <option value="YEARLY">Anual</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Limite de Agendamentos
            </label>
            <select
              value={maxAppointments}
              onChange={(e) => setMaxAppointments(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="-1">Ilimitado</option>
              <option value="2">2 por período</option>
              <option value="4">4 por período</option>
              <option value="6">6 por período</option>
              <option value="8">8 por período</option>
              <option value="12">12 por período</option>
            </select>
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          {isEdit && (
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="px-4 py-2.5 text-destructive font-medium hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
            >
              {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 border border-border rounded-lg text-foreground font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !name || !price}
            className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Salvando..."
              : isEdit
                ? "Salvar"
                : "Criar"}
          </button>
        </div>
      </div>
    </>
  );
}
