"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { companySchema, applicationStatusSchema, type CompanyInput } from "@/lib/validation";
import type { ActionResult } from "./auth";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Not authenticated");
  }
  return session;
}

function toCompanyData(input: CompanyInput) {
  return {
    name: input.name,
    role: input.role,
    ctc: input.ctc || null,
    location: input.location || null,
    description: input.description,
    jobDescription: input.jobDescription,
    minCgpa: input.minCgpa,
    maxBacklogs: input.maxBacklogs,
    allowedDepartments: JSON.stringify(input.allowedDepartments),
    eligibleYears: JSON.stringify(input.eligibleYears),
    deadline: new Date(input.deadline),
    isActive: input.isActive ?? true,
  };
}

export async function createCompany(input: CompanyInput): Promise<ActionResult> {
  await requireAdmin();

  const parsed = companySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.company.create({ data: toCompanyData(parsed.data) });

  revalidatePath("/admin/companies");
  return { success: true };
}

export async function updateCompany(
  id: string,
  input: CompanyInput
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = companySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Company not found" };

  await prisma.company.update({ where: { id }, data: toCompanyData(parsed.data) });

  revalidatePath("/admin/companies");
  revalidatePath(`/admin/companies/${id}`);
  revalidatePath("/student/companies");
  return { success: true };
}

export async function deleteCompany(id: string): Promise<ActionResult> {
  await requireAdmin();

  const existing = await prisma.company.findUnique({ where: { id } });
  if (!existing) return { success: false, error: "Company not found" };

  await prisma.company.delete({ where: { id } });

  revalidatePath("/admin/companies");
  revalidatePath("/student/companies");
  return { success: true };
}

export async function toggleCompanyActive(id: string, isActive: boolean): Promise<ActionResult> {
  await requireAdmin();
  await prisma.company.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/companies");
  revalidatePath("/student/companies");
  return { success: true };
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string
): Promise<ActionResult> {
  await requireAdmin();

  const parsed = applicationStatusSchema.safeParse({ status });
  if (!parsed.success) {
    return { success: false, error: "Invalid status" };
  }

  const existing = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!existing) return { success: false, error: "Application not found" };

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: parsed.data.status },
  });

  revalidatePath(`/admin/companies/${existing.companyId}`);
  revalidatePath("/student/applications");
  return { success: true };
}
