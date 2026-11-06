import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { StudentLoginForm } from "@/components/auth/student-login-form";

export const metadata = { title: "Student Login | Training & Placement Cell" };

export default function StudentLoginPage() {
  return (
    <AuthShell
      title="Student sign in"
      description="Use your enrollment number and college portal password."
      footer={
        <p>
          Placement office?{" "}
          <Link href="/admin/login" className="font-medium text-foreground underline underline-offset-4">
            Sign in here
          </Link>
        </p>
      }
    >
      <Suspense>
        <StudentLoginForm />
      </Suspense>
    </AuthShell>
  );
}
