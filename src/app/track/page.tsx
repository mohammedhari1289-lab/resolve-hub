import type { Metadata } from "next";
import { Search } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/PublicHeader";
import { StatusBadge } from "@/components/ui/Badges";
import { STATUSES, STATUS_LABEL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Track a complaint",
  description: "Enter your ResolveHub complaint ID to see its current status and progress.",
  alternates: { canonical: "/track" },
};

export default async function TrackPage({ searchParams }: { searchParams: { id?: string } }) {
  const id = searchParams.id?.trim().toUpperCase().slice(0, 30);
  // Public view exposes ONLY status + dates + category. No title, description, names or remarks.
  const c = id
    ? await prisma.complaint.findUnique({
        where: { ticketId: id },
        select: {
          ticketId: true, status: true, createdAt: true, updatedAt: true, category: { select: { name: true } },
          history: { orderBy: { createdAt: "asc" }, select: { toStatus: true, createdAt: true, fromStatus: true } },
        },
      })
    : null;
  const reached = c ? STATUSES.indexOf(c.status) : -1;

  return (
    <>
      <PublicHeader />
      <main className="mx-auto min-h-[60vh] max-w-2xl px-4 py-14 sm:px-8">
        <h1 className="text-3xl font-bold">Track a complaint</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Enter the complaint ID you received when you submitted it, for example RH-26-K7M2QX.</p>
        <form className="mt-6 flex gap-2" role="search">
          <input name="id" defaultValue={searchParams.id} placeholder="RH-26-XXXXXX" aria-label="Complaint ID" className="input font-mono uppercase" required />
          <button className="btn-primary" type="submit"><Search className="h-4 w-4" aria-hidden />Track</button>
        </form>

        {id && !c && (
          <p role="alert" className="mt-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
            No complaint found for “{id}”. Check the ID and try again.
          </p>
        )}

        {c && (
          <section className="card mt-6 p-6" aria-label="Complaint status">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-mono text-lg font-semibold">{c.ticketId}</p>
              <StatusBadge status={c.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">{c.category.name} · Submitted {formatDate(c.createdAt)} · Updated {formatDate(c.updatedAt)}</p>

            <ol className="mt-6 grid grid-cols-5 gap-1 text-center text-xs" aria-label="Progress">
              {STATUSES.map((s, i) => (
                <li key={s}>
                  <div className={cn("h-1.5 rounded-full", i <= reached ? "bg-brand-600" : "bg-slate-200 dark:bg-white/10")} />
                  <span className={cn("mt-2 block", i <= reached ? "font-medium" : "text-slate-400")}>{STATUS_LABEL[s]}</span>
                </li>
              ))}
            </ol>

            <h2 className="mt-8 text-sm font-semibold">Status history</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {c.history.filter((h) => h.fromStatus !== h.toStatus).map((h, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span>{STATUS_LABEL[h.toStatus]}</span>
                  <span className="text-slate-500">{formatDate(h.createdAt)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-slate-500">Sign in to see remarks and the full details of your complaint.</p>
          </section>
        )}
      </main>
      <PublicFooter />
    </>
  );
}
