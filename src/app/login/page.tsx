import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/actions/auth";
import { ActionForm, FieldError, SubmitButton } from "@/components/ui/ActionForm";
import { Logo } from "@/components/ui/Logo";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to ResolveHub to raise, track and manage complaints.",
  alternates: { canonical: "/login" },
};

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Logo className="mb-8" />
        <h1 className="text-3xl font-bold">Welcome Home</h1>
        <p className="mt-1 text-slate-500">Sign in to see your complaints.</p>
        <ActionForm action={loginAction} className="card mt-6 space-y-4 p-6">
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="input" />
            <FieldError name="email" />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
            <FieldError name="password" />
          </div>
          <SubmitButton className="w-full">Sign in</SubmitButton>
        </ActionForm>
        <p className="mt-4 text-center text-sm text-slate-500">
          New here? <Link href="/register" className="font-medium text-brand-700 hover:underline dark:text-brand-300">Create an account</Link>
        </p>
        {process.env.NODE_ENV !== "production" && (
          <div className="mt-6 rounded-lg border border-dashed border-slate-300 p-4 text-xs text-slate-500 dark:border-white/15">
            <p className="font-medium text-slate-700 dark:text-slate-300">Demo accounts (seed data)</p>
            <p className="mt-1">Admin: admin@resolvehub.dev / Admin@123</p>
            <p>Staff: staff1@resolvehub.dev / Staff@123</p>
            <p>User: user1@resolvehub.dev / User@123</p>
          </div>
        )}
      </div>
    </main>
  );
}
