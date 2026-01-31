/**
 * Shared StatusBadge component for dashboard views
 * Displays status labels with color-coded backgrounds
 */

export type StatusColor = "green" | "yellow" | "red" | "gray";

interface StatusBadgeProps {
  status: string;
  color: StatusColor;
}

const colorClasses: Record<StatusColor, string> = {
  green: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  yellow:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  red: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  gray: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export function StatusBadge({ status, color }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}
    >
      {status}
    </span>
  );
}
