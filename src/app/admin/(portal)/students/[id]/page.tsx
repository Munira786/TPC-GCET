import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Download, ExternalLink, FileText, Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { DEPARTMENT_LABELS, type Department } from "@/lib/constants";

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id },
    include: { applications: { include: { company: true }, orderBy: { appliedAt: "desc" } } },
  });

  if (!student) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/students"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to students
      </Link>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              {student.name ?? student.enrollmentNumber}
            </h1>
            <p className="text-sm text-muted-foreground">{student.enrollmentNumber}</p>
          </div>
          {student.resumeUrl && (
            <Button
              size="sm"
              render={
                <a href={student.resumeUrl} target="_blank" rel="noreferrer">
                  <Download className="size-4" />
                  Download resume
                </a>
              }
            />
          )}
        </div>

        {!student.profileCompleted ? (
          <p className="mt-6 rounded-md bg-secondary px-4 py-3 text-sm text-muted-foreground">
            This student hasn&apos;t completed their profile yet.
          </p>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoItem label="Department">
                {student.department
                  ? DEPARTMENT_LABELS[student.department as Department] ?? student.department
                  : "—"}
              </InfoItem>
              <InfoItem label="Year">{student.year ?? "—"}</InfoItem>
              <InfoItem label="Email">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" /> {student.email}
                </span>
              </InfoItem>
              <InfoItem label="Phone">
                <span className="flex items-center gap-1.5">
                  <Phone className="size-3.5" /> {student.phone}
                </span>
              </InfoItem>
              <InfoItem label="10th %">{student.tenthPercent}</InfoItem>
              <InfoItem label="12th %">{student.twelfthPercent}</InfoItem>
              <InfoItem label="CGPA">{student.cgpa}</InfoItem>
              <InfoItem label="Backlogs">{student.backlogs ?? 0}</InfoItem>
            </div>

            {(student.skills || student.linkedin || student.github) && (
              <div className="mt-6 space-y-3 border-t border-border pt-6">
                {student.skills && (
                  <InfoItem label="Skills">{student.skills}</InfoItem>
                )}
                <div className="flex flex-wrap gap-4">
                  {student.linkedin && (
                    <a
                      href={student.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
                    >
                      <ExternalLink className="size-4" /> LinkedIn
                    </a>
                  )}
                  {student.github && (
                    <a
                      href={student.github}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
                    >
                      <ExternalLink className="size-4" /> GitHub
                    </a>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Applications</h2>
        {student.applications.length === 0 ? (
          <Card className="flex flex-col items-center gap-2 p-8 text-center">
            <FileText className="size-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No applications submitted yet.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {student.applications.map((app) => (
              <Card key={app.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link
                    href={`/admin/companies/${app.companyId}`}
                    className="font-medium hover:underline underline-offset-4"
                  >
                    {app.company.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Applied {format(app.appliedAt, "d MMM yyyy")}
                  </p>
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

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{children}</p>
    </div>
  );
}
