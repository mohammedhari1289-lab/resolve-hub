import type { Metadata } from "next";
import Link from "next/link";
import { BellOff } from "lucide-react";
import { markNotificationsReadAction } from "@/actions/complaints";
import { ActionForm, SubmitButton } from "@/components/ui/ActionForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser();
  const items = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-slate-500">{unread} unread</p>
        </div>
        {unread > 0 && (
          <ActionForm action={markNotificationsReadAction}>
            <SubmitButton variant="outline">Mark all as read</SubmitButton>
          </ActionForm>
        )}
      </div>
      <div className="card divide-y divide-slate-100 dark:divide-white/5">
        {items.length === 0 ? (
          <EmptyState icon={BellOff} title="You’re all caught up">Status updates and assignments will show up here.</EmptyState>
        ) : (
          items.map((n) => {
            const body = (
              <div className={cn("flex gap-3 p-4", !n.read && "bg-brand-50/60 dark:bg-brand-500/5")}>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-amber-400")} />
                <div>
                  <p className="text-sm">{n.message}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{formatDate(n.createdAt)}</p>
                </div>
              </div>
            );
            return n.link ? <Link key={n.id} href={n.link} className="block hover:bg-slate-50 dark:hover:bg-white/[0.03]">{body}</Link> : <div key={n.id}>{body}</div>;
          })
        )}
      </div>
    </div>
  );
}
