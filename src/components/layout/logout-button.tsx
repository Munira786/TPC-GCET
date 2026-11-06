"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/actions/auth";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-foreground"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await logout();
          router.push("/");
          router.refresh();
        });
      }}
    >
      <LogOut className="size-4" />
      {isPending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
