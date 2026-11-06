"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { companySchema, type CompanyInput } from "@/lib/validation";
import { DEPARTMENTS, DEPARTMENT_LABELS, YEARS } from "@/lib/constants";
import { createCompany, updateCompany } from "@/actions/admin";
import type { Company } from "@prisma/client";

export function CompanyForm({ company }: { company?: Company }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name ?? "",
      role: company?.role ?? "",
      ctc: company?.ctc ?? "",
      location: company?.location ?? "",
      description: company?.description ?? "",
      jobDescription: company?.jobDescription ?? "",
      minCgpa: company?.minCgpa ?? 6,
      maxBacklogs: company?.maxBacklogs ?? 0,
      allowedDepartments: company ? JSON.parse(company.allowedDepartments) : [],
      eligibleYears: company ? JSON.parse(company.eligibleYears) : [],
      deadline: company ? company.deadline.toISOString().slice(0, 10) : "",
      isActive: company?.isActive ?? true,
    },
  });

  const onSubmit = (values: CompanyInput) => {
    startTransition(async () => {
      const result = company
        ? await updateCompany(company.id, values)
        : await createCompany(values);

      if (!result.success) {
        toast.error(result.error ?? "Could not save company");
        return;
      }
      toast.success(company ? "Company updated" : "Company added");
      router.push(company ? `/admin/companies/${company.id}` : "/admin/companies");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Company details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company name" error={errors.name?.message}>
            <Input {...register("name")} placeholder="e.g. TechNova Solutions" />
          </Field>
          <Field label="Role / designation" error={errors.role?.message}>
            <Input {...register("role")} placeholder="e.g. Software Development Engineer" />
          </Field>
          <Field label="CTC" error={errors.ctc?.message}>
            <Input {...register("ctc")} placeholder="e.g. 12 LPA" />
          </Field>
          <Field label="Location" error={errors.location?.message}>
            <Input {...register("location")} placeholder="e.g. Bengaluru" />
          </Field>
          <Field label="Application deadline" error={errors.deadline?.message}>
            <Input {...register("deadline")} type="date" />
          </Field>
        </div>
        <Field label="Company description" error={errors.description?.message}>
          <Textarea {...register("description")} rows={3} placeholder="Short overview of the company" />
        </Field>
        <Field label="Job description" error={errors.jobDescription?.message}>
          <Textarea
            {...register("jobDescription")}
            rows={5}
            placeholder="Role responsibilities, interview process, etc."
          />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Eligibility criteria</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Minimum CGPA" error={errors.minCgpa?.message}>
            <Input
              {...register("minCgpa", { valueAsNumber: true })}
              type="number"
              step="0.1"
              min={0}
              max={10}
            />
          </Field>
          <Field label="Maximum backlogs allowed" error={errors.maxBacklogs?.message}>
            <Input
              {...register("maxBacklogs", { valueAsNumber: true })}
              type="number"
              step="1"
              min={0}
            />
          </Field>
        </div>

        <Field label="Allowed departments" error={errors.allowedDepartments?.message as string}>
          <Controller
            control={control}
            name="allowedDepartments"
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-2.5 rounded-lg border border-border p-3 sm:grid-cols-3">
                {DEPARTMENTS.map((d) => {
                  const checked = field.value?.includes(d);
                  return (
                    <label
                      key={d}
                      title={DEPARTMENT_LABELS[d]}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const next = v
                            ? [...(field.value ?? []), d]
                            : (field.value ?? []).filter((x) => x !== d);
                          field.onChange(next);
                        }}
                      />
                      {d}
                    </label>
                  );
                })}
              </div>
            )}
          />
        </Field>

        <Field label="Eligible years" error={errors.eligibleYears?.message as string}>
          <Controller
            control={control}
            name="eligibleYears"
            render={({ field }) => (
              <div className="flex flex-wrap gap-4 rounded-lg border border-border p-3">
                {YEARS.map((y) => {
                  const checked = field.value?.includes(y);
                  return (
                    <label key={y} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => {
                          const next = v
                            ? [...(field.value ?? []), y]
                            : (field.value ?? []).filter((x) => x !== y);
                          field.onChange(next);
                        }}
                      />
                      Year {y}
                    </label>
                  );
                })}
              </div>
            )}
          />
        </Field>

        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              Visible to students (active listing)
            </label>
          )}
        />
      </section>

      <div className="flex justify-end gap-2 border-t border-border pt-6">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {company ? "Save changes" : "Add company"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
