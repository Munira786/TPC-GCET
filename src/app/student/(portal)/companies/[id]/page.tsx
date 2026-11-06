import Link from "next/link";
import { notFound } from "next/navigation";
import { format, isPast } from "date-fns";
import { ArrowLeft, Building2, Calendar, GraduationCap, MapPin, ShieldCheck, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireCompleteStudentProfile } from "@/lib/require-student";
import { checkEligibility } from "@/lib/eligibility";
import { EligibilityBadge } from "@/components/shared/eligibility-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ApplyButton } from "@/components/student/apply-button";
import { DEPARTMENT_LABELS, type Department } from "@/lib/constants";

export default async function StudentCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const student = await requireCompleteStudentProfile();
  const { id } = await params;

  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) notFound();

  const application = await prisma.application.findUnique({
    where: { studentId_companyId: { studentId: student.id, companyId: id } },
  });

  const { eligible, reasons } = checkEligibility(student, company);
  const closed = !company.isActive || isPast(company.deadline);
  const allowedDepartments: Department[] = JSON.parse(company.allowedDepartments);
  const eligibleYears: number[] = JSON.parse(company.eligibleYears);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/student/companies"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to companies
      </Link>

      <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-secondary">
              <Building2 className="size-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">{company.name}</h1>
              <p className="text-sm text-muted-foreground">{company.role}</p>
            </div>
          </div>
          {application ? (
            <StatusBadge status={application.status} />
          ) : (
            <EligibilityBadge eligible={eligible} />
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {company.ctc && (
            <span className="flex items-center gap-1.5">
              <Wallet className="size-4" /> {company.ctc}
            </span>
          )}
          {company.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" /> {company.location}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4" />
            {closed
              ? "Applications closed"
              : `Deadline: ${format(company.deadline, "d MMM yyyy")}`}
          </span>
        </div>

        <div className="mt-6 space-y-4 border-t border-border pt-6">
          <div>
            <h2 className="text-sm font-semibold">About the company</h2>
            <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground">
              {company.description}
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Job description</h2>
            <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground">
              {company.jobDescription}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold">
            <ShieldCheck className="size-4" /> Eligibility criteria
          </h2>
          <ul className="mt-2 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">
            <li>Minimum CGPA: {company.minCgpa}</li>
            <li>Max backlogs allowed: {company.maxBacklogs}</li>
            <li>
              Departments: {allowedDepartments.map((d) => DEPARTMENT_LABELS[d] ?? d).join(", ")}
            </li>
            <li>Eligible years: {eligibleYears.join(", ")}</li>
          </ul>
          {!application && !eligible && (
            <div className="mt-3 flex items-start gap-1.5 rounded-md bg-background px-3 py-2 text-sm text-muted-foreground">
              <GraduationCap className="mt-0.5 size-4 shrink-0" />
              <ul className="list-inside list-disc space-y-0.5">
                {reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {!application && (
          <div className="mt-6 flex justify-end">
            <ApplyButton
              companyId={company.id}
              disabled={!eligible || closed}
              disabledReason={closed ? "Applications are closed" : reasons[0]}
            />
          </div>
        )}
      </div>
    </div>
  );
}
