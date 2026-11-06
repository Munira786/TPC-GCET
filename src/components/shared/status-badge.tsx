import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/constants";

const STATUS_STYLES: Record<ApplicationStatus, string> = {
  APPLIED:
    "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900",
  SHORTLISTED:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  SELECTED:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
  REJECTED:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status as ApplicationStatus;
  return (
    <Badge variant="outline" className={cn("font-medium", STATUS_STYLES[key])}>
      {STATUS_LABELS[key] ?? status}
    </Badge>
  );
}
