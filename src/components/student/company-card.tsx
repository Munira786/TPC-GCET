import Link from "next/link";
import { formatDistanceToNow, isPast } from "date-fns";
import { Building2, Calendar, MapPin, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EligibilityBadge } from "@/components/shared/eligibility-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ApplyButton } from "@/components/student/apply-button";
import type { Company } from "@prisma/client";

export function CompanyCard({
  company,
  eligible,
  eligibilityReasons,
  applicationStatus,
}: {
  company: Company;
  eligible: boolean;
  eligibilityReasons: string[];
  applicationStatus?: string;
}) {
  const closed = !company.isActive || isPast(company.deadline);

  return (
    <Card className="group flex flex-col gap-4 p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <Building2 className="size-5 text-muted-foreground" />
          </div>
          <div>
            <Link
              href={`/student/companies/${company.id}`}
              className="font-semibold leading-tight hover:underline underline-offset-4"
            >
              {company.name}
            </Link>
            <p className="text-sm text-muted-foreground">{company.role}</p>
          </div>
        </div>
        {applicationStatus ? (
          <StatusBadge status={applicationStatus} />
        ) : (
          <EligibilityBadge eligible={eligible} />
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {company.ctc && (
          <span className="flex items-center gap-1">
            <Wallet className="size-3.5" /> {company.ctc}
          </span>
        )}
        {company.location && (
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" /> {company.location}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="size-3.5" />
          {closed
            ? "Applications closed"
            : `Apply by ${formatDistanceToNow(company.deadline, { addSuffix: true })}`}
        </span>
      </div>

      <p className="line-clamp-2 text-sm text-muted-foreground">{company.description}</p>

      {!applicationStatus && !eligible && eligibilityReasons.length > 0 && (
        <p className="text-xs text-muted-foreground">{eligibilityReasons[0]}</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4">
        <Link
          href={`/student/companies/${company.id}`}
          className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          View details
        </Link>
        {!applicationStatus && (
          <ApplyButton
            companyId={company.id}
            disabled={!eligible || closed}
            disabledReason={closed ? "Applications are closed" : eligibilityReasons[0]}
          />
        )}
      </div>
    </Card>
  );
}
