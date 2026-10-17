import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock3, FileStack, Loader, UserX, Users } from "lucide-react";
import { BarBlock, StatusChart, TrendChart } from "@/components/Charts";
import { ComplaintTable } from "@/components/ComplaintTable";
import { StatCard } from "@/components/ui/StatCard";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDashboardData } from "@/lib/queries";

export const metadata: Metadata = { title: "Dashboard" };

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card p-5 ${className ?? ""}`}>
      <h2 className="mb-2 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const d = await getDashboardData(user);
  const first = user.name.split(" ")[0];

  const copy = {
    USER: { sub: "Here’s where your complaints stand.", scope: "yours" },
    STAFF: { sub: "Complaints assigned to you.", scope: "assigned to you" },
    ADMIN: { sub: "Everything across the system.", scope: "all" },
  }[user.role];

  const [unassigned, userCount, staffCount] =
    user.role === "ADMIN"
      ? await Promise.all([
          prisma.complaint.count({ where: { assignedToId: null, status: { in: ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS"] } } }),
          prisma.user.count({ where: { role: "USER" } }),
          prisma.user.count({ where: { role: "STAFF" } }),
        ])
      : [0, 0, 0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Hello, {first}</h1>
          <p className="text-slate-500">{copy.sub}</p>
        </div>
        {user.role === "USER" && <Link href="/complaints/new" className="btn-primary">New complaint</Link>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total complaints" value={d.stats.total} icon={FileStack} tone="bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200" />
        <StatCard label="Pending" value={d.stats.pending} icon={Clock3} tone="bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" />
        <StatCard label="In progress" value={d.stats.inProgress} icon={Loader} tone="bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" />
        <StatCard label="Resolved" value={d.stats.resolved} icon={CheckCircle2} tone="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" />
      </div>

      {user.role === "ADMIN" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Link href="/complaints?assignee=none" className="card flex items-center gap-3 p-4 hover:border-brand-400">
            <UserX className="h-5 w-5 text-amber-600" aria-hidden />
            <span className="text-sm"><b className="font-display text-xl">{unassigned}</b> open complaints need an assignee</span>
          </Link>
          <Link href="/admin/users" className="card flex items-center gap-3 p-4 hover:border-brand-400">
            <Users className="h-5 w-5 text-brand-600" aria-hidden />
            <span className="text-sm"><b className="font-display text-xl">{userCount}</b> registered users</span>
          </Link>
          <Link href="/admin/users" className="card flex items-center gap-3 p-4 hover:border-brand-400">
            <Users className="h-5 w-5 text-brand-600" aria-hidden />
            <span className="text-sm"><b className="font-display text-xl">{staffCount}</b> staff members</span>
          </Link>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <ChartCard title="Status breakdown"><StatusChart data={d.statusData} /></ChartCard>
        <ChartCard title="Complaints in the last 14 days" className="lg:col-span-2"><TrendChart data={d.trend} /></ChartCard>
        <ChartCard title="By priority"><BarBlock data={d.priorityData} color="#e8a33d" /></ChartCard>
        <ChartCard title="Top categories" className="lg:col-span-2"><BarBlock data={d.categoryData} horizontal /></ChartCard>
      </div>

      <section className="card">
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-base font-semibold">Recent complaints ({copy.scope})</h2>
          <Link href="/complaints" className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-300">View all</Link>
        </div>
        <ComplaintTable rows={d.recent} role={user.role} emptyText={user.role === "USER" ? "Submit your first complaint to see it here." : "Nothing to show yet."} />
      </section>
    </div>
  );
}
