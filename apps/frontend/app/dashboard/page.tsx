"use client";

import Link from "next/link";
import {
  mockDashboardStats,
  mockAppointments,
  mockCustomers,
} from "@/lib/dashboard/mocks";
import {
  AppointmentStatus,
  appointmentStatusColors,
} from "@/lib/dashboard/types";

export default function DashboardPage() {
  const stats = mockDashboardStats;

  // Get today's appointments
  const todayAppointments = mockAppointments
    .filter((a) => {
      const date = new Date(a.date);
      const today = new Date();
      return (
        date.toDateString() === today.toDateString() &&
        a.status !== AppointmentStatus.CANCELED
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Agendamentos Hoje"
          value={stats.todayAppointments}
          icon={
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
          color="blue"
        />
        <StatCard
          label="Esta Semana"
          value={stats.weekAppointments}
          icon={
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          color="green"
        />
        <StatCard
          label="Assinantes Ativos"
          value={stats.activeSubscribers}
          icon={
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
          color="purple"
        />
        <StatCard
          label="Total Clientes"
          value={stats.totalCustomers}
          icon={
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
          color="orange"
        />
      </div>

      {/* Content grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's schedule */}
        <div className="bg-card rounded-xl border border-border p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Agenda de Hoje</h2>
            <Link
              href="/dashboard/schedule"
              className="text-sm text-primary hover:underline"
            >
              Ver tudo
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum agendamento para hoje</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div
                    className="w-1 h-12 rounded-full"
                    style={{
                      backgroundColor:
                        appointmentStatusColors[appointment.status],
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {appointment.customer?.name || "Cliente"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {appointment.service?.name} •{" "}
                      {appointment.service?.duration}min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      {new Date(appointment.date).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      R$ {appointment.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent customers */}
        <div className="bg-card rounded-xl border border-border p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Clientes Recentes</h2>
            <Link
              href="/dashboard/customers"
              className="text-sm text-primary hover:underline"
            >
              Ver todos
            </Link>
          </div>

          <div className="space-y-3">
            {mockCustomers.slice(0, 5).map((customer) => (
              <div
                key={customer.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-medium text-primary">
                    {customer.name?.charAt(0) || "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {customer.name}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {customer.phone}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.statusColor === "green"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : customer.statusColor === "yellow"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : customer.statusColor === "red"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {customer.statusLabel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction
          href="/dashboard/schedule"
          label="Novo Agendamento"
          icon={
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
          }
        />
        <QuickAction
          href="/dashboard/customers"
          label="Novo Cliente"
          icon={
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
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          }
        />
        <QuickAction
          href="/dashboard/catalog"
          label="Gerenciar Serviços"
          icon={
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
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          }
        />
        <QuickAction
          href="/dashboard/settings/finance"
          label="Ver Financeiro"
          icon={
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    green:
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    purple:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    orange:
      "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-sm transition-all"
    >
      <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>
      <span className="font-medium text-foreground text-sm">{label}</span>
    </Link>
  );
}
