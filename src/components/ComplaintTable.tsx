import Link from "next/link";
import type { Role } from "@prisma/client";
import { Inbox } from "lucide-react";
import { PriorityBadge, StatusBadge } from "@/components/ui/Badges";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDay } from "@/lib/utils";

type Row = {
  id: string;
  ticketId: string;
  title: string;
  priority: Parameters<typeof PriorityBadge>[0]["priority"];
  status: Parameters<typeof StatusBadge>[0]["status"];
  createdAt: Date;
  category: { name: string };
  user: { name: string };
  assignedTo: { name: string } | null;
};

export function ComplaintTable({ rows, role, emptyText }: { rows: Row[]; role: Role; emptyText?: string }) {
  if (!rows.length) {
    return (
      <EmptyState icon={Inbox} title="No complaints found">
        {emptyText ?? "Nothing matches yet."}
      </EmptyState>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px]">
        <thead className="border-b border-slate-200 dark:border-white/10">
          <tr>
            <th className="th">Complaint ID</th>
            <th className="th">Title</th>
            <th className="th">Category</th>
            <th className="th">Priority</th>
            <th className="th">Status</th>
            {role !== "USER" && <th className="th">Submitted by</th>}
            {role === "ADMIN" && <th className="th">Assigned to</th>}
            <th className="th">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
          {rows.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03]">
              <td className="td font-mono text-xs">
                <Link href={`/complaints/${c.ticketId}`} className="font-semibold text-brand-700 hover:underline dark:text-brand-300">{c.ticketId}</Link>
              </td>
              <td className="td max-w-[280px] truncate">{c.title}</td>
              <td className="td text-slate-600 dark:text-slate-300">{c.category.name}</td>
              <td className="td"><PriorityBadge priority={c.priority} /></td>
              <td className="td"><StatusBadge status={c.status} /></td>
              {role !== "USER" && <td className="td">{c.user.name}</td>}
              {role === "ADMIN" && <td className="td">{c.assignedTo?.name ?? <span className="text-amber-600 dark:text-amber-400">Unassigned</span>}</td>}
              <td className="td whitespace-nowrap text-slate-500">{formatDay(c.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
