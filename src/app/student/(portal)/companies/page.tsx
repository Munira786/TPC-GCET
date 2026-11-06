import Link from "next/link";
import { Building2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireCompleteStudentProfile } from "@/lib/require-student";
import { checkEligibility } from "@/lib/eligibility";
import { CompanyCard } from "@/components/student/company-card";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export const metadata = { title: "Companies | Training & Placement Cell" };

export default async function StudentCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const student = await requireCompleteStudentProfile();
  const { view } = await searchParams;
  const showAll = view === "all";

  const [companies, applications] = await Promise.all([
    prisma.company.findMany({
      where: { isActive: true },
      orderBy: { deadline: "asc" },
    }),
    prisma.application.findMany({ where: { studentId: student.id } }),
  ]);

  const appliedByCompany = new Map(applications.map((a) => [a.companyId, a.status]));

  const withEligibility = companies.map((company) => {
    const { eligible, reasons } = checkEligibility(student, company);
    return { company, eligible, reasons, status: appliedByCompany.get(company.id) };
  });

  const visible = showAll
    ? withEligibility
    : withEligibility.filter((c) => c.eligible || c.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {showAll
              ? "All open companies, with your eligibility for each."
              : "Companies you're currently eligible for."}
          </p>
        </div>
        <div className="flex rounded-lg border border-border bg-secondary/40 p-1 text-sm">
          <Link
            href="/student/companies"
            className={cn(
              "rounded-md px-3 py-1.5 font-medium transition-colors",
              !showAll ? "bg-background shadow-sm" : "text-muted-foreground"
            )}
          >
            Eligible for you
          </Link>
          <Link
            href="/student/companies?view=all"
            className={cn(
              "rounded-md px-3 py-1.5 font-medium transition-colors",
              showAll ? "bg-background shadow-sm" : "text-muted-foreground"
            )}
          >
            All companies
          </Link>
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={showAll ? "No open companies right now" : "No eligible companies yet"}
          description={
            showAll
              ? "Check back soon — the placement office adds new companies regularly."
              : "None of the currently open companies match your profile yet. Switch to “All companies” to see what's coming up."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(({ company, eligible, reasons, status }) => (
            <CompanyCard
              key={company.id}
              company={company}
              eligible={eligible}
              eligibilityReasons={reasons}
              applicationStatus={status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
