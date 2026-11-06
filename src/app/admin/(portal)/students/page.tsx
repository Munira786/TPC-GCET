import Link from "next/link";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
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
import { StudentFilters } from "@/components/admin/student-filters";
import { DEPARTMENT_LABELS, type Department } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

export const metadata = { title: "Students | Training & Placement Cell" };

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; year?: string; minCgpa?: string }>;
}) {
  const { department, year, minCgpa } = await searchParams;

  const where: Prisma.StudentWhereInput = {};
  if (department) where.department = department;
  if (year) where.year = Number(year);
  if (minCgpa) where.cgpa = { gte: Number(minCgpa) };

  const students = await prisma.student.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {students.length} student{students.length === 1 ? "" : "s"} registered
          </p>
        </div>
        <StudentFilters department={department} year={year} minCgpa={minCgpa} />
      </div>

      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No students match these filters"
          description="Try adjusting or clearing the filters above."
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>CGPA</TableHead>
                  <TableHead>Backlogs</TableHead>
                  <TableHead>Profile</TableHead>
                  <TableHead>Applications</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <Link
                        href={`/admin/students/${s.id}`}
                        className="font-medium hover:underline underline-offset-4"
                      >
                        {s.name ?? s.enrollmentNumber}
                      </Link>
                      <p className="text-xs text-muted-foreground">{s.enrollmentNumber}</p>
                    </TableCell>
                    <TableCell>
                      {s.department ? DEPARTMENT_LABELS[s.department as Department] ?? s.department : "—"}
                    </TableCell>
                    <TableCell>{s.year ?? "—"}</TableCell>
                    <TableCell>{s.cgpa ?? "—"}</TableCell>
                    <TableCell>{s.backlogs ?? 0}</TableCell>
                    <TableCell>
                      {s.profileCompleted ? (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Incomplete
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{s._count.applications}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}
