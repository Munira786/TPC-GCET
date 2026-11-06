import Link from "next/link";
import { Building2, Briefcase, Users, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { format } from "date-fns";

export const metadata = { title: "Admin Dashboard | Training & Placement Cell" };

export default async function AdminDashboardPage() {
  const [studentCount, companyCount, applicationCount, selectedCount, recentApplications] =
    await Promise.all([
      prisma.student.count(),
      prisma.company.count(),
      prisma.application.count(),
      prisma.application.count({ where: { status: "SELECTED" } }),
      prisma.application.findMany({
        include: { student: true, company: true },
        orderBy: { appliedAt: "desc" },
        take: 8,
      }),
    ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A snapshot of the current placement season.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Registered students" value={studentCount} href="/admin/students" />
        <StatCard icon={Building2} label="Companies listed" value={companyCount} href="/admin/companies" />
        <StatCard icon={Briefcase} label="Total applications" value={applicationCount} />
        <StatCard icon={CheckCircle2} label="Students selected" value={selectedCount} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Recent applications</h2>
        {recentApplications.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No applications yet"
            description="Applications will appear here as students apply to companies you've listed."
          />
        ) : (
          <Card className="divide-y divide-border overflow-hidden">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div>
                  <p className="text-sm font-medium">
                    {app.student.name ?? app.student.enrollmentNumber}{" "}
                    <span className="font-normal text-muted-foreground">
                      applied to
                    </span>{" "}
                    <Link
                      href={`/admin/companies/${app.companyId}`}
                      className="hover:underline underline-offset-4"
                    >
                      {app.company.name}
                    </Link>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(app.appliedAt, "d MMM yyyy, h:mm a")}
                  </p>
                </div>
                <StatusBadge status={app.status} />
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  href?: string;
}) {
  const content = (
    <Card className="flex items-center gap-4 p-5 transition-shadow hover:shadow-md">
      <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-2xl font-semibold leading-none">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
