import { redirect } from "next/navigation";
import { getSession } from "./auth";
import { prisma } from "./prisma";

export async function requireStudentRecord() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/student/login");
  }
  const student = await prisma.student.findUnique({ where: { id: session.id } });
  if (!student) {
    redirect("/student/login");
  }
  return student;
}

export async function requireCompleteStudentProfile() {
  const student = await requireStudentRecord();
  if (!student.profileCompleted) {
    redirect("/student/profile?required=1");
  }
  return student;
}

export async function requireAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }
  return session;
}
