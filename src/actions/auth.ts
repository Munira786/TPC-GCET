"use server";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { studentLoginSchema, adminLoginSchema } from "@/lib/validation";

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function studentLogin(input: {
  enrollmentNumber: string;
  password: string;
}): Promise<ActionResult> {
  const parsed = studentLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const student = await prisma.student.findUnique({
    where: { enrollmentNumber: parsed.data.enrollmentNumber.toUpperCase() },
  });

  if (!student) {
    return { success: false, error: "Invalid enrollment number or password" };
  }

  const valid = await verifyPassword(parsed.data.password, student.password);
  if (!valid) {
    return { success: false, error: "Invalid enrollment number or password" };
  }

  await setSessionCookie({
    id: student.id,
    role: "STUDENT",
    name: student.name ?? student.enrollmentNumber,
  });

  return { success: true };
}

export async function adminLogin(input: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  const parsed = adminLoginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const admin = await prisma.admin.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!admin) {
    return { success: false, error: "Invalid email or password" };
  }

  const valid = await verifyPassword(parsed.data.password, admin.password);
  if (!valid) {
    return { success: false, error: "Invalid email or password" };
  }

  await setSessionCookie({ id: admin.id, role: "ADMIN", name: admin.name });

  return { success: true };
}

export async function logout(): Promise<void> {
  await clearSessionCookie();
}
