import { StatCardSkeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: number;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "gray" | "yellow" | "red";
  isLoading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  color = "blue",
  isLoading = false,
  className,
}: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    green:
      "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    purple:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    orange:
      "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    gray: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    yellow:
      "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-muted h-10 w-10 animate-pulse" />
          )}
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-card rounded-xl border border-border p-4 ${className || ""}`}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        )}
        <div>
          <p
            className={`text-2xl font-bold ${!icon ? getColorText(color) : "text-foreground"}`}
          >
            {value}
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

function getColorText(color: string) {
  switch (color) {
    case "green":
      return "text-green-600";
    case "yellow":
      return "text-yellow-600";
    case "red":
      return "text-red-600";
    case "gray":
      return "text-gray-600";
    default:
      return "text-foreground";
  }
}
