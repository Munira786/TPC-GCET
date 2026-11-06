import Link from "next/link";
import { format, isPast } from "date-fns";
import { Building2, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export const metadata = { title: "Companies | Training & Placement Cell" };

export default async function AdminCompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {companies.length} compan{companies.length === 1 ? "y" : "ies"} listed
          </p>
        </div>
        <Button
          render={
            <Link href="/admin/companies/new">
              <Plus className="size-4" />
              Add company
            </Link>
          }
        />
      </div>

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Add a company to start collecting applications from eligible students."
          action={
            <Button size="sm" render={<Link href="/admin/companies/new">Add company</Link>} />
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => {
            const closed = !company.isActive || isPast(company.deadline);
            return (
              <Link key={company.id} href={`/admin/companies/${company.id}`}>
                <Card className="flex h-full flex-col gap-3 p-5 transition-shadow hover:shadow-md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <Building2 className="size-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold leading-tight">{company.name}</p>
                        <p className="text-sm text-muted-foreground">{company.role}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        closed
                          ? "text-muted-foreground"
                          : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
                      }
                    >
                      {closed ? "Closed" : "Open"}
                    </Badge>
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-sm text-muted-foreground">
                    <span>{company._count.applications} applicants</span>
                    <span>Deadline {format(company.deadline, "d MMM yyyy")}</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
