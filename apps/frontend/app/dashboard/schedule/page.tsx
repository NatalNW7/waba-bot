"use client";

import { useState, useMemo } from "react";
import {
  useAppointments,
  useConfirmAppointment,
  useCancelAppointment,
} from "@/lib/hooks";
import {
  AppointmentStatus,
  appointmentStatusColors,
  type DashboardAppointment,
} from "@/lib/dashboard/types";

type CalendarView = "day" | "week" | "month";

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("week");
  const [selectedAppointment, setSelectedAppointment] =
    useState<DashboardAppointment | null>(null);

  // Fetch appointments using React Query
  const { data: appointmentsData, isLoading, error } = useAppointments();
  const appointments = (appointmentsData as DashboardAppointment[]) || [];

  // Navigate calendar
  const navigate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (view === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else if (view === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  // Format header date
  const headerDate = useMemo(() => {
    if (view === "day") {
      return currentDate.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } else if (view === "week") {
      const weekStart = new Date(currentDate);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${weekStart.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })} - ${weekEnd.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" })}`;
    } else {
      return currentDate.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
    }
  }, [currentDate, view]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground mt-1 capitalize">{headerDate}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
          >
            Hoje
          </button>
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => navigate("prev")}
              className="p-2 hover:bg-muted transition-colors"
              aria-label="Anterior"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() => navigate("next")}
              className="p-2 hover:bg-muted transition-colors"
              aria-label="Próximo"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="flex justify-center sm:justify-start">
        <div className="inline-flex rounded-lg border border-border p-1 bg-muted/30">
          {(["day", "week", "month"] as CalendarView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                view === v
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {v === "day" ? "Dia" : v === "week" ? "Semana" : "Mês"}
            </button>
          ))}
        </div>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: appointmentStatusColors.PENDING }}
          />
          <span className="text-muted-foreground">Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: appointmentStatusColors.CONFIRMED }}
          />
          <span className="text-muted-foreground">Confirmado</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: appointmentStatusColors.CANCELED }}
          />
          <span className="text-muted-foreground">Cancelado</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: appointmentStatusColors.COMPLETED }}
          />
          <span className="text-muted-foreground">Concluído</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {view === "week" && (
          <WeekView
            currentDate={currentDate}
            appointments={appointments}
            onAppointmentClick={setSelectedAppointment}
          />
        )}
        {view === "day" && (
          <DayView
            currentDate={currentDate}
            appointments={appointments}
            onAppointmentClick={setSelectedAppointment}
          />
        )}
        {view === "month" && (
          <MonthView
            currentDate={currentDate}
            appointments={appointments}
            onAppointmentClick={setSelectedAppointment}
          />
        )}
      </div>

      {/* Appointment Modal */}
      {selectedAppointment && (
        <AppointmentModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
}

// Week View Component
function WeekView({
  currentDate,
  appointments,
  onAppointmentClick,
}: {
  currentDate: Date;
  appointments: DashboardAppointment[];
  onAppointmentClick: (a: DashboardAppointment) => void;
}) {
  const weekStart = new Date(currentDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    return day;
  });

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8am to 7pm

  const getAppointmentsForDayHour = (day: Date, hour: number) => {
    return appointments.filter((a) => {
      const aDate = new Date(a.date);
      return (
        aDate.toDateString() === day.toDateString() && aDate.getHours() === hour
      );
    });
  };

  const isToday = (day: Date) =>
    day.toDateString() === new Date().toDateString();

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Day headers */}
        <div className="grid grid-cols-8 border-b border-border">
          <div className="p-2" /> {/* Empty corner cell */}
          {days.map((day) => (
            <div
              key={day.toISOString()}
              className={`p-2 text-center border-l border-border ${
                isToday(day) ? "bg-primary/5" : ""
              }`}
            >
              <p className="text-xs text-muted-foreground">
                {day.toLocaleDateString("pt-BR", { weekday: "short" })}
              </p>
              <p
                className={`text-lg font-semibold ${isToday(day) ? "text-primary" : "text-foreground"}`}
              >
                {day.getDate()}
              </p>
            </div>
          ))}
        </div>

        {/* Time grid */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-8 border-b border-border last:border-b-0"
          >
            <div className="p-2 text-xs text-muted-foreground text-right pr-3 py-4">
              {hour.toString().padStart(2, "0")}:00
            </div>
            {days.map((day) => {
              const dayAppointments = getAppointmentsForDayHour(day, hour);
              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[60px] border-l border-border p-1 ${
                    isToday(day) ? "bg-primary/5" : ""
                  }`}
                >
                  {dayAppointments.map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => onAppointmentClick(apt)}
                      className="w-full text-left p-1.5 rounded text-xs text-white mb-1 truncate"
                      style={{
                        backgroundColor: appointmentStatusColors[apt.status],
                      }}
                    >
                      {apt.customer?.name?.split(" ")[0]}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// Day View Component
function DayView({
  currentDate,
  appointments,
  onAppointmentClick,
}: {
  currentDate: Date;
  appointments: DashboardAppointment[];
  onAppointmentClick: (a: DashboardAppointment) => void;
}) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 8);

  const dayAppointments = appointments.filter(
    (a) => new Date(a.date).toDateString() === currentDate.toDateString(),
  );

  const getAppointmentsForHour = (hour: number) => {
    return dayAppointments.filter((a) => new Date(a.date).getHours() === hour);
  };

  return (
    <div className="divide-y divide-border">
      {hours.map((hour) => {
        const hourAppointments = getAppointmentsForHour(hour);
        return (
          <div key={hour} className="flex min-h-[80px]">
            <div className="w-16 sm:w-20 flex-shrink-0 p-2 text-sm text-muted-foreground text-right pr-3 border-r border-border">
              {hour.toString().padStart(2, "0")}:00
            </div>
            <div className="flex-1 p-2 space-y-1">
              {hourAppointments.map((apt) => (
                <button
                  key={apt.id}
                  onClick={() => onAppointmentClick(apt)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left"
                  style={{
                    backgroundColor: appointmentStatusColors[apt.status] + "20",
                  }}
                >
                  <div
                    className="w-1 h-10 rounded-full"
                    style={{
                      backgroundColor: appointmentStatusColors[apt.status],
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {apt.customer?.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {apt.service?.name} • {apt.service?.duration}min
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    R$ {apt.price}
                  </p>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Month View Component
function MonthView({
  currentDate,
  appointments,
  onAppointmentClick,
}: {
  currentDate: Date;
  appointments: DashboardAppointment[];
  onAppointmentClick: (a: DashboardAppointment) => void;
}) {
  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  );
  const lastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  );
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const daysInMonth = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - startOffset + 1;
    if (dayNum < 1 || dayNum > totalDays) return null;
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNum);
  });

  const getAppointmentsForDay = (day: Date | null) => {
    if (!day) return [];
    return appointments.filter(
      (a) => new Date(a.date).toDateString() === day.toDateString(),
    );
  };

  const isToday = (day: Date | null) =>
    day?.toDateString() === new Date().toDateString();
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div>
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs text-muted-foreground font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {daysInMonth.map((day, i) => {
          const dayAppointments = getAppointmentsForDay(day);
          return (
            <div
              key={i}
              className={`min-h-[80px] sm:min-h-[100px] p-1 border-b border-r border-border ${
                !day ? "bg-muted/30" : isToday(day) ? "bg-primary/5" : ""
              }`}
            >
              {day && (
                <>
                  <p
                    className={`text-sm font-medium p-1 ${isToday(day) ? "text-primary" : "text-foreground"}`}
                  >
                    {day.getDate()}
                  </p>
                  <div className="space-y-0.5">
                    {dayAppointments.slice(0, 3).map((apt) => (
                      <button
                        key={apt.id}
                        onClick={() => onAppointmentClick(apt)}
                        className="w-full text-left px-1.5 py-0.5 rounded text-[10px] sm:text-xs text-white truncate"
                        style={{
                          backgroundColor: appointmentStatusColors[apt.status],
                        }}
                      >
                        {new Date(apt.date).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </button>
                    ))}
                    {dayAppointments.length > 3 && (
                      <p className="text-[10px] text-muted-foreground text-center">
                        +{dayAppointments.length - 3} mais
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Appointment Modal
function AppointmentModal({
  appointment,
  onClose,
}: {
  appointment: DashboardAppointment;
  onClose: () => void;
}) {
  const confirmMutation = useConfirmAppointment();
  const cancelMutation = useCancelAppointment();

  const handleConfirm = () => {
    confirmMutation.mutate(appointment.id, {
      onSuccess: () => onClose(),
    });
  };

  const handleCancel = () => {
    if (confirm("Tem certeza que deseja cancelar este agendamento?")) {
      cancelMutation.mutate(
        { id: appointment.id },
        {
          onSuccess: () => onClose(),
        },
      );
    }
  };

  const isLoading = confirmMutation.isPending || cancelMutation.isPending;

  const statusLabels: Record<AppointmentStatus, string> = {
    [AppointmentStatus.PENDING]: "Pendente",
    [AppointmentStatus.CONFIRMED]: "Confirmado",
    [AppointmentStatus.CANCELED]: "Cancelado",
    [AppointmentStatus.COMPLETED]: "Concluído",
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-card rounded-2xl shadow-xl z-50 overflow-hidden">
        {/* Header */}
        <div
          className="p-4 text-white"
          style={{
            backgroundColor: appointmentStatusColors[appointment.status],
          }}
        >
          <div className="flex items-center justify-between">
            <span className="px-2 py-0.5 bg-white/20 rounded text-sm">
              {statusLabels[appointment.status]}
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white/20 transition-colors"
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
          <h3 className="text-xl font-bold mt-2">
            {appointment.customer?.name}
          </h3>
          <p className="opacity-90">{appointment.customer?.phone}</p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Serviço</p>
              <p className="font-medium text-foreground">
                {appointment.service?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duração</p>
              <p className="font-medium text-foreground">
                {appointment.service?.duration} minutos
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data</p>
              <p className="font-medium text-foreground">
                {new Date(appointment.date).toLocaleDateString("pt-BR", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Horário</p>
              <p className="font-medium text-foreground">
                {new Date(appointment.date).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Valor</p>
              <p className="text-xl font-bold text-foreground">
                R$ {appointment.price}
              </p>
            </div>
          </div>

          {appointment.cancellationReason && (
            <div className="p-3 bg-destructive/10 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                Motivo do cancelamento:
              </p>
              <p className="text-sm text-destructive/80">
                {appointment.cancellationReason}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border flex gap-2">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            Fechar
          </button>
          {appointment.status === AppointmentStatus.PENDING && (
            <>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-destructive text-destructive rounded-lg font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                {cancelMutation.isPending ? "Cancelando..." : "Cancelar"}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {confirmMutation.isPending ? "Confirmando..." : "Confirmar"}
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
