import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AdminLoginForm } from "@/components/auth/admin-login-form";

export const metadata = { title: "Admin Login | Training & Placement Cell" };

export default function AdminLoginPage() {
  return (
    <AuthShell
      title="Placement office sign in"
      description="Sign in with your administrator credentials."
      footer={
        <p>
          Student?{" "}
          <Link href="/student/login" className="font-medium text-foreground underline underline-offset-4">
            Sign in here
          </Link>
        </p>
      }
    >
      <Suspense>
        <AdminLoginForm />
      </Suspense>
    </AuthShell>
  );
}
