import type { Metadata } from "next";
import Link from "next/link";
import { BellRing, ChartNoAxesCombined, FilePenLine, ShieldCheck, Search, UserCheck } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/PublicHeader";
import { STATUSES, STATUS_LABEL, STATUS_STYLE } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ResolveHub – Raise, track and resolve complaints",
  description: "A complaint management system for campuses and organisations: unique complaint IDs, live status tracking, staff assignment and analytics.",
  alternates: { canonical: "/" },
};

const features = [
  { icon: FilePenLine, title: "Raise a complaint in a minute", text: "Pick a category and priority, describe the problem and get a unique complaint ID straight away." },
  { icon: Search, title: "Track without logging in", text: "Anyone holding a complaint ID can check its current status and see how far it has moved." },
  { icon: UserCheck, title: "Clear ownership", text: "Admins assign every complaint to a staff member who updates the status and adds remarks." },
  { icon: BellRing, title: "Updates when they happen", text: "Status changes and remarks reach the complainant as in-app notifications." },
  { icon: ChartNoAxesCombined, title: "Live analytics", text: "Totals, pending, in-progress and resolved counts with charts, always calculated from the database." },
  { icon: ShieldCheck, title: "Private by default", text: "Users only see their own complaints, staff only see theirs. Permissions are enforced on the server." },
];

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ResolveHub",
    applicationCategory: "BusinessApplication",
    description: "Complaint management system with tracking, assignment and analytics.",
  };
  return (
    <>
      <PublicHeader />
      <main>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <section className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <h1 className="text-4xl font-bold leading-[1.05] sm:text-6xl">
              Every complaint gets an ID, an owner and an answer.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              ResolveHub gives students and staff one place to report problems, follow each step toward a fix, and close the loop when it’s done.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="btn-primary px-5 py-3">Raise a complaint</Link>
              <Link href="/track" className="btn-outline px-5 py-3">Track with a complaint ID</Link>
            </div>
          </div>

          <div className="card self-center p-6" aria-label="Complaint lifecycle">
            <p className="text-sm text-slate-500">A complaint’s journey</p>
            <ol className="mt-4 space-y-0">
              {STATUSES.map((s, i) => (
                <li key={s} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className={cn("h-3 w-3 rounded-full ring-4 ring-white dark:ring-ink-900", i === 2 ? "bg-blue-500" : i < 2 ? "bg-brand-500" : "bg-slate-300 dark:bg-slate-600")} />
                    {i < STATUSES.length - 1 && <span className="h-10 w-px bg-slate-200 dark:bg-white/10" />}
                  </div>
                  <div className="-mt-1.5 pb-4">
                    <span className={cn("rounded-md px-2 py-0.5 text-xs font-medium", STATUS_STYLE[s])}>{STATUS_LABEL[s]}</span>
                    <p className="mt-1 text-sm text-slate-500">
                      {["You file it and receive an ID.", "An admin checks it and assigns staff.", "Staff work on the fix and post remarks.", "Staff share what was done.", "You confirm and the case is closed."][i]}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white py-16 dark:border-white/10 dark:bg-ink-900" aria-labelledby="features">
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <h2 id="features" className="max-w-2xl text-3xl font-bold">Built so nothing gets lost between “submitted” and “resolved”</h2>
            <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <div key={f.title}>
                  <f.icon className="h-6 w-6 text-brand-600" aria-hidden />
                  <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-8">
          <h2 className="text-3xl font-bold">Have an issue that needs fixing?</h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-600 dark:text-slate-300">Create a free account and file your first complaint in under a minute.</p>
          <Link href="/register" className="btn-primary mt-6 px-6 py-3">Create account</Link>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
