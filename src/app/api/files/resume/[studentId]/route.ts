import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resumePathForStudent } from "@/lib/files";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId } = await params;

  if (session.role === "STUDENT" && session.id !== studentId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || !student.resumeUrl) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  try {
    const buffer = await readFile(resumePathForStudent(studentId));
    const filename = student.resumeName ?? `${student.enrollmentNumber}-resume.pdf`;
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Resume not found on disk" }, { status: 404 });
  }
}
