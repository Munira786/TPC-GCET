import Link from "next/link";
import { ArrowRight, GraduationCap, ShieldCheck, Briefcase, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getSession();
  if (session?.role === "STUDENT") redirect("/student/dashboard");
  if (session?.role === "ADMIN") redirect("/admin/dashboard");

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-md bg-foreground text-background text-sm font-semibold">
              TP
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Training &amp; Placement Cell
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/admin/login">Admin</Link>} />
            <Button size="sm" render={<Link href="/student/login">Student login</Link>} />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center gap-10 px-4 py-20 text-center sm:px-6 sm:py-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Briefcase className="size-3.5" />
            Campus placements, streamlined
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            One portal for every placement, from application to offer.
          </h1>
          <p className="max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
            Students track eligibility and applications in one place. The
            placement office manages companies, criteria, and hiring status
            without spreadsheets.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              render={
                <Link href="/student/login">
                  I&apos;m a student
                  <ArrowRight className="size-4" />
                </Link>
              }
            />
            <Button
              size="lg"
              variant="outline"
              render={
                <Link href="/admin/login">
                  Placement office login
                  <ShieldCheck className="size-4" />
                </Link>
              }
            />
          </div>

          <div className="mt-10 grid w-full max-w-4xl gap-4 text-left sm:grid-cols-3">
            <FeatureCard
              icon={GraduationCap}
              title="Eligibility, automatically"
              description="Students only see companies they actually qualify for — CGPA, department, backlogs, and year, checked instantly."
            />
            <FeatureCard
              icon={Users}
              title="One profile, every application"
              description="Fill academics and upload a resume once. Apply to any eligible company in a click."
            />
            <FeatureCard
              icon={ShieldCheck}
              title="Full visibility for the TPC"
              description="Manage companies, review applicants, update hiring status, and export applicant lists to CSV."
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 py-6">
        <p className="text-center text-xs text-muted-foreground">
          Training &amp; Placement Cell Portal
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof GraduationCap;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-secondary">
        <Icon className="size-4.5" />
      </div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
