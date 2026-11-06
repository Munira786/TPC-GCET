"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  UserCircle,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "./logout-button";

interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_CONFIG: Record<"student" | "admin", NavLink[]> = {
  student: [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/companies", label: "Companies", icon: Building2 },
    { href: "/student/applications", label: "My applications", icon: ClipboardList },
    { href: "/student/profile", label: "Profile", icon: UserCircle },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/companies", label: "Companies", icon: Building2 },
  ],
};

export function PortalNav({
  variant,
  brand,
  name,
  subtitle,
}: {
  variant: "student" | "admin";
  brand: string;
  name: string;
  subtitle: string;
}) {
  const pathname = usePathname();
  const links = NAV_CONFIG[variant];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href={links[0]?.href ?? "/"} className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-foreground text-background text-sm font-semibold">
              TP
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">
              {brand}
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                  <Icon className="size-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight">{name}</p>
            <p className="text-xs text-muted-foreground leading-tight">{subtitle}</p>
          </div>
          <LogoutButton />
        </div>
      </div>
      <nav className="flex items-center gap-1 overflow-x-auto border-t border-border/70 px-4 py-1.5 md:hidden">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium",
                active
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="size-3.5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
