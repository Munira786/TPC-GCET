import { PortalNav } from "@/components/layout/portal-nav";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const student = session
    ? await prisma.student.findUnique({ where: { id: session.id } })
    : null;

  return (
    <div className="flex min-h-svh flex-col bg-secondary/20">
      <PortalNav
        variant="student"
        brand="Training & Placement Cell"
        name={student?.name ?? session?.name ?? "Student"}
        subtitle={student?.enrollmentNumber ?? ""}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
