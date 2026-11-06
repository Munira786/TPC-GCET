"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { studentProfileSchema, type StudentProfileInput } from "@/lib/validation";
import { saveResume, MAX_RESUME_SIZE_BYTES } from "@/lib/files";
import { checkEligibility } from "@/lib/eligibility";
import type { ActionResult } from "./auth";

async function requireStudent() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    throw new Error("Not authenticated");
  }
  return session;
}

export async function updateStudentProfile(
  input: StudentProfileInput,
  resume: File | null
): Promise<ActionResult> {
  const session = await requireStudent();

  const parsed = studentProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const student = await prisma.student.findUnique({ where: { id: session.id } });
  if (!student) return { success: false, error: "Student not found" };

  let resumeUrl = student.resumeUrl;
  let resumeName = student.resumeName;

  if (resume && resume.size > 0) {
    if (resume.type !== "application/pdf") {
      return { success: false, error: "Resume must be a PDF file" };
    }
    if (resume.size > MAX_RESUME_SIZE_BYTES) {
      return { success: false, error: "Resume must be under 5MB" };
    }
    const buffer = Buffer.from(await resume.arrayBuffer());
    await saveResume(student.id, buffer);
    resumeUrl = `/api/files/resume/${student.id}`;
    resumeName = resume.name;
  }

  if (!resumeUrl && !student.profileCompleted) {
    return { success: false, error: "Please upload your resume (PDF)" };
  }

  const { skills, linkedin, github, ...rest } = parsed.data;

  await prisma.student.update({
    where: { id: student.id },
    data: {
      ...rest,
      skills: skills || null,
      linkedin: linkedin || null,
      github: github || null,
      resumeUrl,
      resumeName,
      profileCompleted: true,
    },
  });

  revalidatePath("/student", "layout");
  return { success: true };
}

export async function applyToCompany(companyId: string): Promise<ActionResult> {
  const session = await requireStudent();

  const student = await prisma.student.findUnique({ where: { id: session.id } });
  if (!student) return { success: false, error: "Student not found" };

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return { success: false, error: "Company not found" };

  if (!company.isActive || company.deadline < new Date()) {
    return { success: false, error: "Applications for this company are closed" };
  }

  const eligibility = checkEligibility(student, company);
  if (!eligibility.eligible) {
    return { success: false, error: eligibility.reasons[0] ?? "You are not eligible" };
  }

  const existing = await prisma.application.findUnique({
    where: { studentId_companyId: { studentId: student.id, companyId } },
  });
  if (existing) {
    return { success: false, error: "You have already applied to this company" };
  }

  await prisma.application.create({
    data: { studentId: student.id, companyId },
  });

  revalidatePath("/student/companies");
  revalidatePath("/student/applications");
  revalidatePath("/student/dashboard");
  return { success: true };
}
