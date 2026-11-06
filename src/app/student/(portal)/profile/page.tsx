import { requireStudentRecord } from "@/lib/require-student";
import { ProfileForm } from "@/components/student/profile-form";

export const metadata = { title: "My Profile | Training & Placement Cell" };

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ required?: string }>;
}) {
  const student = await requireStudentRecord();
  const { required } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Keep your academic details and resume up to date — this is what
          companies and the placement office will see.
        </p>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <ProfileForm student={student} requiredBanner={required === "1"} />
      </div>
    </div>
  );
}
