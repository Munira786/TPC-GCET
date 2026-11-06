"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyToCompany } from "@/actions/student";

export function ApplyButton({
  companyId,
  disabled,
  disabledReason,
}: {
  companyId: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (disabled) {
    return (
      <Button size="sm" disabled title={disabledReason}>
        <Send className="size-4" />
        Apply
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await applyToCompany(companyId);
          if (!result.success) {
            toast.error(result.error ?? "Could not submit application");
            return;
          }
          toast.success("Application submitted");
          router.refresh();
        });
      }}
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
      Apply
    </Button>
  );
}
