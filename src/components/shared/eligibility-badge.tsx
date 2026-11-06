import { CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function EligibilityBadge({ eligible }: { eligible: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1 font-medium",
        eligible
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "border-border bg-secondary text-muted-foreground"
      )}
    >
      {eligible ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
      {eligible ? "Eligible" : "Not eligible"}
    </Badge>
  );
}
