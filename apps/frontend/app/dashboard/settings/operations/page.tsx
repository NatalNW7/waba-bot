"use client";

import { useState, useEffect } from "react";
import { useOperatingHours, useCalendar } from "@/lib/hooks";
import { DayOfWeek, dayOfWeekLabels } from "@/lib/dashboard/types";
import type {
  DashboardOperatingHour,
  DashboardCalendar,
} from "@/lib/dashboard/types";

export default function OperationsSettingsPage() {
  // Fetch data using React Query
  const { data: calendarData, isLoading: calendarLoading } = useCalendar();
  const { data: hoursData, isLoading: hoursLoading } = useOperatingHours();

  const calendar = useMemo(
    () => (calendarData as DashboardCalendar) || null,
    [calendarData],
  );
  const fetchedHours = useMemo(
    () => (hoursData as DashboardOperatingHour[]) || [],
    [hoursData],
  );
  const isLoading = calendarLoading || hoursLoading;

  const [operatingHours, setOperatingHours] = useState<
    DashboardOperatingHour[]
  >([]);

  // Sync fetched hours with local state when data loads
  const [prevFetchedHours, setPrevFetchedHours] = useState<
    DashboardOperatingHour[]
  >([]);

  if (fetchedHours !== prevFetchedHours && fetchedHours.length > 0) {
    setPrevFetchedHours(fetchedHours);
    setOperatingHours(fetchedHours);
  }

  const isCalendarConnected = calendar?.isConnected && !!calendar.accessToken;

  const handleHourChange = (
    id: string,
    field: "startTime" | "endTime" | "isClosed",
    value: string | boolean,
  ) => {
    setOperatingHours((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: value } : h)),
    );
  };

  // Order days
  const orderedDays = [
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
    DayOfWeek.SUNDAY,
  ];

  const sortedHours = orderedDays
    .map((day) => operatingHours.find((h) => h.day === day))
    .filter(Boolean) as DashboardOperatingHour[];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-5 w-64 bg-muted rounded mt-2 animate-pulse" />
        </div>
        <div className="bg-card rounded-xl border border-border p-6 animate-pulse">
          <div className="h-24 bg-muted rounded" />
        </div>
        <div className="bg-card rounded-xl border border-border p-6 animate-pulse">
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Operações</h1>
        <p className="text-muted-foreground mt-1">
          Configure suas integrações e horários de funcionamento
        </p>
      </div>

      {/* Google Calendar Card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#4285f4]/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285f4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34a853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#fbbc05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#ea4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Google Calendar</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isCalendarConnected
                ? `Sincronizado com ${calendar?.email}`
                : "Sincronize seus agendamentos com o Google Calendar."}
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          {isCalendarConnected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Sincronizado
                </span>
              </div>
              <button className="text-sm text-destructive hover:underline">
                Desconectar
              </button>
            </div>
          ) : (
            <button className="w-full py-2.5 bg-[#4285f4] text-white rounded-lg font-medium hover:bg-[#3367d6] transition-colors flex items-center justify-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              </svg>
              Conectar Google Calendar
            </button>
          )}
        </div>
      </div>

      {/* Operating Hours */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">
            Horário de Funcionamento
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Defina quando seu estabelecimento está aberto para agendamentos
          </p>
        </div>

        {/* Mobile view */}
        <div className="sm:hidden divide-y divide-border">
          {sortedHours.map((hour) => (
            <div key={hour.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">
                  {hour.dayLabel}
                </span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-muted-foreground">Fechado</span>
                  <input
                    type="checkbox"
                    checked={hour.isClosed}
                    onChange={(e) =>
                      handleHourChange(hour.id, "isClosed", e.target.checked)
                    }
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary/50"
                  />
                </label>
              </div>
              {!hour.isClosed && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={hour.startTime}
                    onChange={(e) =>
                      handleHourChange(hour.id, "startTime", e.target.value)
                    }
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <span className="text-muted-foreground">até</span>
                  <input
                    type="time"
                    value={hour.endTime}
                    onChange={(e) =>
                      handleHourChange(hour.id, "endTime", e.target.value)
                    }
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              )}
              {hour.onlyForSubscribers && !hour.isClosed && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  Apenas assinantes
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop view */}
        <div className="hidden sm:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground w-32">
                  Dia
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Abertura
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Fechamento
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground w-24">
                  Fechado
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-muted-foreground w-32">
                  Assinantes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedHours.map((hour) => (
                <tr
                  key={hour.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {hour.dayLabel}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="time"
                      value={hour.startTime}
                      onChange={(e) =>
                        handleHourChange(hour.id, "startTime", e.target.value)
                      }
                      disabled={hour.isClosed}
                      className={`px-3 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        hour.isClosed ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="time"
                      value={hour.endTime}
                      onChange={(e) =>
                        handleHourChange(hour.id, "endTime", e.target.value)
                      }
                      disabled={hour.isClosed}
                      className={`px-3 py-1.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                        hour.isClosed ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={hour.isClosed}
                      onChange={(e) =>
                        handleHourChange(hour.id, "isClosed", e.target.checked)
                      }
                      className="w-5 h-5 rounded border-border text-primary focus:ring-primary/50"
                    />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {hour.onlyForSubscribers ? (
                      <span className="inline-flex px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                        Sim
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-border flex justify-end">
          <button className="px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
