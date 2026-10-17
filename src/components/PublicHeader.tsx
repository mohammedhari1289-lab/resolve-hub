import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getCurrentUser } from "@/lib/auth";

export async function PublicHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-[#f5f7f6]/90 backdrop-blur dark:border-white/10 dark:bg-ink-950/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-8">
        <Logo />
        <nav className="ml-auto flex items-center gap-1 text-sm" aria-label="Primary">
          <Link href="/track" className="rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-white/10">Track complaint</Link>
          <ThemeToggle />
          {user ? (
            <Link href="/dashboard" className="btn-primary">Open dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-lg px-3 py-2 font-medium text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-white/10 sm:block">Sign in</Link>
              <Link href="/register" className="btn-primary">Create account</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 py-8 text-sm text-slate-500 dark:border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 sm:flex-row sm:justify-between sm:px-8">
        <p>© {new Date().getFullYear()} ResolveHub – Complaint Management System. College project.</p>
        <p className="flex gap-4">
          <Link href="/track" className="hover:underline">Track a complaint</Link>
          <Link href="/login" className="hover:underline">Sign in</Link>
        </p>
      </div>
    </footer>
  );
}
