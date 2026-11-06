import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { STATUS_LABELS, type ApplicationStatus } from "@/lib/constants";

function csvEscape(value: string | number | null | undefined) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  const applications = await prisma.application.findMany({
    where: { companyId: id },
    include: { student: true },
    orderBy: { appliedAt: "asc" },
  });

  const header = [
    "Enrollment Number",
    "Name",
    "Email",
    "Phone",
    "Department",
    "Year",
    "CGPA",
    "Backlogs",
    "Status",
    "Applied At",
  ];

  const rows = applications.map((app) => [
    app.student.enrollmentNumber,
    app.student.name,
    app.student.email,
    app.student.phone,
    app.student.department,
    app.student.year,
    app.student.cgpa,
    app.student.backlogs,
    STATUS_LABELS[app.status as ApplicationStatus] ?? app.status,
    app.appliedAt.toISOString(),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  const safeName = company.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${safeName}-applicants.csv"`,
    },
  });
}
