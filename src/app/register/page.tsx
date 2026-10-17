import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/actions/auth";
import { ActionForm, FieldError, SubmitButton } from "@/components/ui/ActionForm";
import { Logo } from "@/components/ui/Logo";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a ResolveHub account to submit complaints and track their progress.",
  alternates: { canonical: "/register" },
};

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Logo className="mb-8" />
        <h1 className="text-3xl font-bold">Create your account</h1>
        <p className="mt-1 text-slate-500">Raise complaints and follow them to resolution.</p>
        <ActionForm action={registerAction} className="card mt-6 space-y-4 p-6">
          <div>
            <label htmlFor="name" className="label">Full name</label>
            <input id="name" name="name" autoComplete="name" required className="input" />
            <FieldError name="name" />
          </div>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="input" />
            <FieldError name="email" />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" name="password" type="password" autoComplete="new-password" required className="input" />
            <p className="mt-1 text-xs text-slate-500">At least 8 characters, with a letter and a number.</p>
            <FieldError name="password" />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="label">Confirm password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required className="input" />
            <FieldError name="confirmPassword" />
          </div>
          <SubmitButton className="w-full">Create account</SubmitButton>
        </ActionForm>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already registered? <Link href="/login" className="font-medium text-brand-700 hover:underline dark:text-brand-300">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
