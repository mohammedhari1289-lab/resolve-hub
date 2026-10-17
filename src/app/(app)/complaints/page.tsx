import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma, Priority, Status } from "@prisma/client";
import { Search } from "lucide-react";
import { ComplaintTable } from "@/components/ComplaintTable";
import { Pagination } from "@/components/ui/Pagination";
import { PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scopeWhere } from "@/lib/queries";

export const metadata: Metadata = { title: "Complaints" };
const PAGE_SIZE = 10;

type SP = { q?: string; status?: string; priority?: string; categoryId?: string; assignee?: string; page?: string };

export default async function ComplaintsPage({ searchParams }: { searchParams: SP }) {
  const user = await requireUser();
  const q = searchParams.q?.trim().slice(0, 100);
  const status = STATUSES.find((s) => s === searchParams.status) as Status | undefined;
  const priority = PRIORITIES.find((p) => p === searchParams.priority) as Priority | undefined;
  const page = Math.max(1, Number.parseInt(searchParams.page ?? "1", 10) || 1);

  const filters: Prisma.ComplaintWhereInput[] = [scopeWhere(user)]; // access scope is ALWAYS applied
  if (q)
    filters.push({
      OR: [
        { ticketId: { contains: q, mode: "insensitive" } },
        { title: { contains: q, mode: "insensitive" } },
        { category: { name: { contains: q, mode: "insensitive" } } },
      ],
    });
  if (status) filters.push({ status });
  if (priority) filters.push({ priority });
  if (searchParams.categoryId) filters.push({ categoryId: searchParams.categoryId });
  if (user.role === "ADMIN" && searchParams.assignee === "none") filters.push({ assignedToId: null });
  else if (user.role === "ADMIN" && searchParams.assignee) filters.push({ assignedToId: searchParams.assignee });
  const where: Prisma.ComplaintWhereInput = { AND: filters };

  const [rows, total, categories, staff] = await Promise.all([
    prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: true, user: { select: { name: true } }, assignedTo: { select: { name: true } } },
    }),
    prisma.complaint.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    user.role === "ADMIN" ? prisma.user.findMany({ where: { role: "STAFF" }, orderBy: { name: "asc" }, select: { id: true, name: true } }) : [],
  ]);

  const title = user.role === "USER" ? "My complaints" : user.role === "STAFF" ? "Assigned to me" : "All complaints";
  const hasFilters = !!(q || status || priority || searchParams.categoryId || searchParams.assignee);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-slate-500">{total} {total === 1 ? "complaint" : "complaints"}{hasFilters ? " match your filters" : ""}</p>
        </div>
        {user.role === "USER" && <Link href="/complaints/new" className="btn-primary">New complaint</Link>}
      </div>

      <form className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6" role="search">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden />
          <input name="q" defaultValue={q} placeholder="Search by ID, title or category" aria-label="Search complaints" className="input pl-9" />
        </div>
        <select name="status" defaultValue={status ?? ""} aria-label="Status" className="input">
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select name="priority" defaultValue={priority ?? ""} aria-label="Priority" className="input">
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
        </select>
        <select name="categoryId" defaultValue={searchParams.categoryId ?? ""} aria-label="Category" className="input">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {user.role === "ADMIN" ? (
          <select name="assignee" defaultValue={searchParams.assignee ?? ""} aria-label="Assignee" className="input">
            <option value="">Any assignee</option>
            <option value="none">Unassigned</option>
            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        ) : <div className="hidden lg:block" />}
        <div className="flex gap-2 sm:col-span-2 lg:col-span-6 lg:justify-end">
          <button className="btn-primary" type="submit">Apply filters</button>
          {hasFilters && <Link href="/complaints" className="btn-outline">Clear</Link>}
        </div>
      </form>

      <div className="card">
        <ComplaintTable rows={rows} role={user.role} emptyText={hasFilters ? "Try different keywords or clear the filters." : user.role === "USER" ? "You haven’t submitted any complaints yet." : "No complaints are assigned yet."} />
        <Pagination page={page} pages={Math.ceil(total / PAGE_SIZE)} params={{ q, status, priority, categoryId: searchParams.categoryId, assignee: searchParams.assignee }} />
      </div>
    </div>
  );
}
