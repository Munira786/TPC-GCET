import { z } from "zod";
import { DEPARTMENTS, YEARS, APPLICATION_STATUSES } from "./constants";

export const studentLoginSchema = z.object({
  enrollmentNumber: z.string().trim().min(1, "Enrollment number is required"),
  password: z.string().min(1, "Password is required"),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const studentProfileSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.string().trim().email("Enter a valid email"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  department: z.enum(DEPARTMENTS, { message: "Select your department" }),
  year: z
    .number()
    .refine((v) => (YEARS as readonly number[]).includes(v), {
      message: "Select your year",
    }),
  tenthPercent: z.number().min(0, "Must be between 0 and 100").max(100, "Must be between 0 and 100"),
  twelfthPercent: z.number().min(0, "Must be between 0 and 100").max(100, "Must be between 0 and 100"),
  cgpa: z.number().min(0, "Must be between 0 and 10").max(10, "Must be between 0 and 10"),
  backlogs: z.number().min(0, "Cannot be negative").max(50, "That doesn't look right"),
  skills: z.string().trim().optional().or(z.literal("")),
  linkedin: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  github: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;

export const companySchema = z.object({
  name: z.string().trim().min(2, "Company name is required"),
  role: z.string().trim().min(2, "Role is required"),
  ctc: z.string().trim().optional().or(z.literal("")),
  location: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().min(10, "Give a short description"),
  jobDescription: z.string().trim().min(10, "Give a job description"),
  minCgpa: z.number().min(0).max(10),
  maxBacklogs: z.number().min(0).max(50),
  allowedDepartments: z
    .array(z.enum(DEPARTMENTS))
    .min(1, "Select at least one department"),
  eligibleYears: z
    .array(z.number())
    .min(1, "Select at least one year"),
  deadline: z.string().min(1, "Deadline is required"),
  isActive: z.boolean().optional(),
});

export type CompanyInput = z.infer<typeof companySchema>;

export const applicationStatusSchema = z.object({
  status: z.enum(APPLICATION_STATUSES),
});
