"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { studentProfileSchema, type StudentProfileInput } from "@/lib/validation";
import { DEPARTMENTS, DEPARTMENT_LABELS, YEARS } from "@/lib/constants";
import { updateStudentProfile } from "@/actions/student";
import type { Student } from "@prisma/client";

export function ProfileForm({
  student,
  requiredBanner,
}: {
  student: Student;
  requiredBanner: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StudentProfileInput>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      name: student.name ?? "",
      email: student.email ?? "",
      phone: student.phone ?? "",
      department: (student.department as StudentProfileInput["department"]) ?? undefined,
      year: student.year ?? undefined,
      tenthPercent: student.tenthPercent ?? undefined,
      twelfthPercent: student.twelfthPercent ?? undefined,
      cgpa: student.cgpa ?? undefined,
      backlogs: student.backlogs ?? 0,
      skills: student.skills ?? "",
      linkedin: student.linkedin ?? "",
      github: student.github ?? "",
    },
  });

  const onSubmit = (values: StudentProfileInput) => {
    startTransition(async () => {
      const result = await updateStudentProfile(values, resumeFile);
      if (!result.success) {
        toast.error(result.error ?? "Could not save profile");
        return;
      }
      toast.success("Profile saved");
      router.push("/student/dashboard");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {requiredBanner && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-200">
          Complete your profile to start browsing and applying to companies.
        </div>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold">Personal details</h2>
          <p className="text-sm text-muted-foreground">
            Enrollment number:{" "}
            <span className="font-medium text-foreground">{student.enrollmentNumber}</span>
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" error={errors.name?.message}>
            <Input {...register("name")} placeholder="Aarav Sharma" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <Input {...register("email")} type="email" placeholder="you@college.edu" />
          </Field>
          <Field label="Phone" error={errors.phone?.message}>
            <Input {...register("phone")} placeholder="10-digit mobile number" />
          </Field>
          <Field label="Department" error={errors.department?.message}>
            <Controller
              control={control}
              name="department"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {DEPARTMENT_LABELS[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Year of study" error={errors.year?.message}>
            <Controller
              control={control}
              name="year"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        Year {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Academic details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="10th percentage" error={errors.tenthPercent?.message}>
            <Input
              {...register("tenthPercent", { valueAsNumber: true })}
              type="number"
              step="0.01"
              min={0}
              max={100}
              placeholder="e.g. 92"
            />
          </Field>
          <Field label="12th percentage" error={errors.twelfthPercent?.message}>
            <Input
              {...register("twelfthPercent", { valueAsNumber: true })}
              type="number"
              step="0.01"
              min={0}
              max={100}
              placeholder="e.g. 88"
            />
          </Field>
          <Field label="Current CGPA" error={errors.cgpa?.message}>
            <Input
              {...register("cgpa", { valueAsNumber: true })}
              type="number"
              step="0.01"
              min={0}
              max={10}
              placeholder="e.g. 8.5"
            />
          </Field>
          <Field label="Active backlogs" error={errors.backlogs?.message}>
            <Input
              {...register("backlogs", { valueAsNumber: true })}
              type="number"
              step="1"
              min={0}
              placeholder="0"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Resume</h2>
        <div className="rounded-lg border border-dashed border-border p-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm">
              <FileText className="size-5 text-muted-foreground" />
              {resumeFile ? (
                <span className="font-medium">{resumeFile.name}</span>
              ) : student.resumeUrl ? (
                <a
                  href={student.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  {student.resumeName ?? "Current resume"}
                </a>
              ) : (
                <span className="text-muted-foreground">No resume uploaded yet</span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4" />
              {student.resumeUrl ? "Replace PDF" : "Upload PDF"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">PDF only, up to 5MB.</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Skills &amp; links (optional)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Skills" error={errors.skills?.message} className="sm:col-span-2">
            <Input {...register("skills")} placeholder="e.g. JavaScript, React, SQL (comma-separated)" />
          </Field>
          <Field label="LinkedIn URL" error={errors.linkedin?.message}>
            <Input {...register("linkedin")} placeholder="https://linkedin.com/in/..." />
          </Field>
          <Field label="GitHub URL" error={errors.github?.message}>
            <Input {...register("github")} placeholder="https://github.com/..." />
          </Field>
        </div>
      </section>

      <div className="flex justify-end border-t border-border pt-6">
        <Button type="submit" disabled={isPending} size="lg">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Save profile
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
