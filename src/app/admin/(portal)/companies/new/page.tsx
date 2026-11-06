import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CompanyForm } from "@/components/admin/company-form";

export const metadata = { title: "Add Company | Training & Placement Cell" };

export default function NewCompanyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/admin/companies"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to companies
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add a company</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Set the job details and eligibility criteria for this drive.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <CompanyForm />
      </div>
    </div>
  );
}
