import type { Student, Company } from "@prisma/client";

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
}

export function checkEligibility(
  student: Pick<Student, "cgpa" | "backlogs" | "department" | "year" | "profileCompleted">,
  company: Pick<Company, "minCgpa" | "maxBacklogs" | "allowedDepartments" | "eligibleYears">
): EligibilityResult {
  const reasons: string[] = [];

  if (!student.profileCompleted) {
    return { eligible: false, reasons: ["Complete your profile to check eligibility"] };
  }

  const cgpa = student.cgpa ?? 0;
  const backlogs = student.backlogs ?? 0;
  const allowedDepartments: string[] = JSON.parse(company.allowedDepartments);
  const eligibleYears: number[] = JSON.parse(company.eligibleYears);

  if (cgpa < company.minCgpa) {
    reasons.push(`Requires CGPA ≥ ${company.minCgpa} (yours: ${cgpa})`);
  }
  if (backlogs > company.maxBacklogs) {
    reasons.push(`Allows max ${company.maxBacklogs} backlog(s) (yours: ${backlogs})`);
  }
  if (student.department && !allowedDepartments.includes(student.department)) {
    reasons.push(`Not open to your department`);
  }
  if (student.year && !eligibleYears.includes(student.year)) {
    reasons.push(`Not open to your year`);
  }

  return { eligible: reasons.length === 0, reasons };
}
