import Link from "next/link";
import { format } from "date-fns";
import { ClipboardList, MapPin, Wallet } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudentRecord } from "@/lib/require-student";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "My Applications | Training & Placement Cell" };

export default async function StudentApplicationsPage() {
  const student = await requireStudentRecord();

  const applications = await prisma.application.findMany({
    where: { studentId: student.id },
    include: { company: true },
    orderBy: { appliedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My applications</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track the status of every company you&apos;ve applied to.
        </p>
      </div>

      {applications.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No applications yet"
          description="Once you apply to companies you're eligible for, they'll show up here with live status updates."
          action={
            <Button size="sm" render={<Link href="/student/companies">Browse companies</Link>} />
          }
        />
      ) : (
        <div className="space-y-3">
          {applications.map((app) => (
            <Card key={app.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <Link
                  href={`/student/companies/${app.companyId}`}
                  className="font-semibold hover:underline underline-offset-4"
                >
                  {app.company.name}
                </Link>
                <p className="text-sm text-muted-foreground">{app.company.role}</p>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {app.company.ctc && (
                    <span className="flex items-center gap-1">
                      <Wallet className="size-3.5" /> {app.company.ctc}
                    </span>
                  )}
                  {app.company.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" /> {app.company.location}
                    </span>
                  )}
                  <span>Applied {format(app.appliedAt, "d MMM yyyy")}</span>
                </div>
              </div>
              <StatusBadge status={app.status} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
