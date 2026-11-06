import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CompanyForm } from "@/components/admin/company-form";

export const metadata = { title: "Edit Company | Training & Placement Cell" };

export default async function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/admin/companies/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Back to {company.name}
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Edit company</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update job details and eligibility criteria.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <CompanyForm company={company} />
      </div>
    </div>
  );
}
