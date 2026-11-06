import Link from "next/link";
import { Briefcase, Building2, CheckCircle2, ClipboardList, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudentRecord } from "@/lib/require-student";
import { checkEligibility } from "@/lib/eligibility";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata = { title: "Dashboard | Training & Placement Cell" };

export default async function StudentDashboardPage() {
  const student = await requireStudentRecord();

  if (!student.profileCompleted) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="p-8 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-secondary">
            <ClipboardList className="size-5 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-semibold">Welcome to the placement portal</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Complete your one-time profile with your academic details and
            resume to start browsing and applying to companies.
          </p>
          <Button className="mt-6" render={<Link href="/student/profile">Complete your profile</Link>} />
        </Card>
      </div>
    );
  }

  const [companies, applications] = await Promise.all([
    prisma.company.findMany({ where: { isActive: true } }),
    prisma.application.findMany({
      where: { studentId: student.id },
      include: { company: true },
      orderBy: { appliedAt: "desc" },
      take: 5,
    }),
  ]);

  const eligibleCount = companies.filter((c) => checkEligibility(student, c).eligible).length;
  const selectedCount = applications.filter((a) => a.status === "SELECTED").length;

  const totalApplications = await prisma.application.count({ where: { studentId: student.id } });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {student.name?.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s where things stand with your placements.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Building2}
          label="Eligible companies"
          value={eligibleCount}
          href="/student/companies"
        />
        <StatCard
          icon={Briefcase}
          label="Applications submitted"
          value={totalApplications}
          href="/student/applications"
        />
        <StatCard icon={CheckCircle2} label="Offers received" value={selectedCount} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recent applications</h2>
          <Link
            href="/student/applications"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        </div>
        {applications.length === 0 ? (
          <EmptyState
            icon={TrendingUp}
            title="No applications yet"
            description="Browse companies you're eligible for and submit your first application."
            action={
              <Button size="sm" render={<Link href="/student/companies">Browse companies</Link>} />
            }
          />
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <Card
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <Link
                    href={`/student/companies/${app.companyId}`}
                    className="font-medium hover:underline underline-offset-4"
                  >
                    {app.company.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">{app.company.role}</p>
                </div>
                <StatusBadge status={app.status} />
              </Card>
            ))}
          </div>
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
  icon: typeof Building2;
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
