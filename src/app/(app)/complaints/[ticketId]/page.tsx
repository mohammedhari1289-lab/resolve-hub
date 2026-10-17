import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { assignComplaintAction, updateStatusAction } from "@/actions/complaints";
import { ActionForm, FieldError, SubmitButton } from "@/components/ui/ActionForm";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badges";
import { STATUSES, STATUS_LABEL } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scopeWhere } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Complaint details" };

export default async function ComplaintDetailPage({ params, searchParams }: { params: { ticketId: string }; searchParams: { created?: string } }) {
  const user = await requireUser();

  // Scope is part of the query: other people's complaints simply don't exist for this user (404, no information leak).
  const c = await prisma.complaint.findFirst({
    where: { AND: [{ ticketId: params.ticketId }, scopeWhere(user)] },
    include: {
      category: { include: { department: true } },
      user: { select: { name: true, email: true } },
      assignedTo: { select: { id: true, name: true } },
      history: { orderBy: { createdAt: "asc" }, include: { actor: { select: { name: true, role: true } } } },
    },
  });
  if (!c) notFound();

  const staff = user.role === "ADMIN" ? await prisma.user.findMany({ where: { role: "STAFF", active: true }, orderBy: { name: "asc" }, include: { department: true } }) : [];
  const isAssignee = user.role === "STAFF" && c.assignedToId === user.id;
  const staffOptions = STATUSES.filter((s) => ["UNDER_REVIEW", "IN_PROGRESS", "RESOLVED"].includes(s));
  const statusOptions = user.role === "ADMIN" ? STATUSES : staffOptions;
  const canUpdate = user.role === "ADMIN" || isAssignee;
  const canClose = user.role === "USER" && c.status === "RESOLVED";

  return (
    <div className="space-y-6">
      {searchParams.created && (
        <p role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> Complaint submitted. Keep your ID <b className="font-mono">{c.ticketId}</b> to track it anytime.
        </p>
      )}

      <div>
        <p className="font-mono text-sm text-slate-500">{c.ticketId}</p>
        <h1 className="mt-1 text-3xl font-bold">{c.title}</h1>
        <div className="mt-3 flex flex-wrap gap-2"><StatusBadge status={c.status} /><PriorityBadge priority={c.priority} /></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="text-base font-semibold">Description</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">{c.description}</p>
          </section>

          {c.resolution && (
            <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <h2 className="text-base font-semibold text-emerald-900 dark:text-emerald-200">Resolution</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-emerald-900 dark:text-emerald-100">{c.resolution}</p>
              {c.resolvedAt && <p className="mt-2 text-xs text-emerald-800/70 dark:text-emerald-200/70">Resolved {formatDate(c.resolvedAt)}</p>}
            </section>
          )}

          <section className="card p-6">
            <h2 className="text-base font-semibold">Updates</h2>
            <ol className="mt-4">
              {c.history.map((h, i) => (
                <li key={h.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-brand-600" />
                    {i < c.history.length - 1 && <span className="w-px flex-1 bg-slate-200 dark:bg-white/10" />}
                  </div>
                  <div className="pb-6">
                    <p className="text-sm font-medium">
                      {h.fromStatus === h.toStatus ? `Remark · ${STATUS_LABEL[h.toStatus]}` : STATUS_LABEL[h.toStatus]}
                    </p>
                    {h.remark && <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">{h.remark}</p>}
                    <p className="mt-0.5 text-xs text-slate-500">{h.actor?.name ?? "System"} · {formatDate(h.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-5 text-sm">
            <h2 className="text-base font-semibold">Details</h2>
            <dl className="mt-3 space-y-3">
              {[
                ["Category", c.category.name],
                ["Department", c.category.department?.name ?? "—"],
                ["Submitted by", c.user.name],
                ["Assigned to", c.assignedTo?.name ?? "Not assigned yet"],
                ["Submitted", formatDate(c.createdAt)],
                ["Last update", formatDate(c.updatedAt)],
              ].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-slate-500">{k}</dt><dd className="font-medium">{v}</dd></div>
              ))}
            </dl>
          </section>

          {user.role === "ADMIN" && (
            <ActionForm action={assignComplaintAction} className="card space-y-3 p-5">
              <h2 className="text-base font-semibold">Assign staff</h2>
              <input type="hidden" name="ticketId" value={c.ticketId} />
              <select name="staffId" defaultValue={c.assignedToId ?? ""} aria-label="Staff member" className="input">
                <option value="">Unassigned</option>
                {staff.map((s) => <option key={s.id} value={s.id}>{s.name}{s.department ? ` · ${s.department.name}` : ""}</option>)}
              </select>
              <SubmitButton className="w-full">Save assignment</SubmitButton>
            </ActionForm>
          )}

          {canUpdate && (
            <ActionForm action={updateStatusAction} resetOnSuccess className="card space-y-3 p-5">
              <h2 className="text-base font-semibold">Update status</h2>
              <input type="hidden" name="ticketId" value={c.ticketId} />
              <select name="status" defaultValue={c.status} aria-label="Status" className="input">
                {statusOptions.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
              <div>
                <textarea name="remark" rows={3} maxLength={1000} placeholder="Remark (required when resolving)" aria-label="Remark" className="input" />
                <FieldError name="remark" />
              </div>
              <SubmitButton className="w-full">Save update</SubmitButton>
            </ActionForm>
          )}

          {canClose && (
            <ActionForm action={updateStatusAction} className="card space-y-3 p-5">
              <h2 className="text-base font-semibold">Is this fixed?</h2>
              <p className="text-sm text-slate-500">If the resolution works for you, close the complaint.</p>
              <input type="hidden" name="ticketId" value={c.ticketId} />
              <input type="hidden" name="status" value="CLOSED" />
              <textarea name="remark" rows={2} maxLength={1000} placeholder="Optional feedback" aria-label="Feedback" className="input" />
              <SubmitButton className="w-full">Confirm and close</SubmitButton>
            </ActionForm>
          )}
        </aside>
      </div>
    </div>
  );
}
