import { PortalNav } from "@/components/layout/portal-nav";
import { requireAdminSession } from "@/lib/require-student";

export default async function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  return (
    <div className="flex min-h-svh flex-col bg-secondary/20">
      <PortalNav
        variant="admin"
        brand="TPC Admin"
        name={session.name}
        subtitle="Placement office"
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
