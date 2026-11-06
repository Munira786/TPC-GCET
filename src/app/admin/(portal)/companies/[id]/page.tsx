import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Download, Pencil, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusSelect } from "@/components/admin/status-select";
import { DeleteCompanyButton } from "@/components/admin/delete-company-button";
import { DEPARTMENT_LABELS, type Department } from "@/lib/constants";

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      applications: {
        include: { student: true },
        orderBy: { appliedAt: "desc" },
      },
    },
  });

  if (!company) notFound();

  const allowedDepartments: Department[] = JSON.parse(company.allowedDepartments);
  const eligibleYears: number[] = JSON.parse(company.eligibleYears);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/companies"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to companies
      </Link>

      <Card className="p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{company.name}</h1>
              <Badge variant="outline" className={company.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300" : "text-muted-foreground"}>
                {company.isActive ? "Active" : "Hidden"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{company.role}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              render={
                <Link href={`/admin/companies/${company.id}/edit`}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              }
            />
            <DeleteCompanyButton companyId={company.id} companyName={company.name} />
          </div>
        </div>

        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          {company.ctc && <p><span className="text-muted-foreground">CTC:</span> {company.ctc}</p>}
          {company.location && <p><span className="text-muted-foreground">Location:</span> {company.location}</p>}
          <p><span className="text-muted-foreground">Deadline:</span> {format(company.deadline, "d MMM yyyy")}</p>
          <p><span className="text-muted-foreground">Min CGPA:</span> {company.minCgpa}</p>
          <p><span className="text-muted-foreground">Max backlogs:</span> {company.maxBacklogs}</p>
          <p><span className="text-muted-foreground">Years:</span> {eligibleYears.join(", ")}</p>
          <p className="sm:col-span-2">
            <span className="text-muted-foreground">Departments:</span>{" "}
            {allowedDepartments.map((d) => DEPARTMENT_LABELS[d] ?? d).join(", ")}
          </p>
        </div>
      </Card>

      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">
            Applicants ({company.applications.length})
          </h2>
          {company.applications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              render={
                <a href={`/api/admin/companies/${company.id}/export`}>
                  <Download className="size-4" />
                  Export CSV
                </a>
              }
            />
          )}
        </div>

        {company.applications.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No applicants yet"
            description="Once eligible students apply, they'll show up here."
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>CGPA</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {company.applications.map((app) => (
                    <TableRow key={app.id}>
                      <TableCell>
                        <Link
                          href={`/admin/students/${app.studentId}`}
                          className="font-medium hover:underline underline-offset-4"
                        >
                          {app.student.name ?? app.student.enrollmentNumber}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {app.student.enrollmentNumber}
                        </p>
                      </TableCell>
                      <TableCell>
                        {app.student.department
                          ? DEPARTMENT_LABELS[app.student.department as Department] ??
                            app.student.department
                          : "—"}
                      </TableCell>
                      <TableCell>{app.student.cgpa ?? "—"}</TableCell>
                      <TableCell>{format(app.appliedAt, "d MMM yyyy")}</TableCell>
                      <TableCell>
                        <StatusSelect applicationId={app.id} status={app.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
