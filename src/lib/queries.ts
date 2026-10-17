import type { Prisma, Role } from "@prisma/client";
import { prisma } from "./prisma";
import { PRIORITIES, PRIORITY_LABEL, STATUSES, STATUS_LABEL } from "./constants";

type Scope = { id: string; role: Role };

/** Row-level access rule used by EVERY complaint query:
 *  users see their own, staff see what is assigned to them, admins see everything. */
export function scopeWhere(u: Scope): Prisma.ComplaintWhereInput {
  if (u.role === "ADMIN") return {};
  if (u.role === "STAFF") return { assignedToId: u.id };
  return { userId: u.id };
}

export async function getDashboardData(u: Scope) {
  const where = scopeWhere(u);
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 13);

  const [byStatus, byPriority, byCategory, recentDates, recent] = await Promise.all([
    prisma.complaint.groupBy({ by: ["status"], where, _count: { _all: true } }),
    prisma.complaint.groupBy({ by: ["priority"], where, _count: { _all: true } }),
    prisma.complaint.groupBy({ by: ["categoryId"], where, _count: { _all: true } }),
    prisma.complaint.findMany({ where: { ...where, createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { category: true, user: { select: { name: true } }, assignedTo: { select: { name: true } } },
    }),
  ]);

  const statusCount = Object.fromEntries(byStatus.map((r) => [r.status, r._count._all]));
  const count = (s: string) => (statusCount[s] as number | undefined) ?? 0;
  const total = byStatus.reduce((n, r) => n + r._count._all, 0);

  const categories = await prisma.category.findMany({
    where: { id: { in: byCategory.map((c) => c.categoryId) } },
    select: { id: true, name: true },
  });
  const catName = new Map(categories.map((c) => [c.id, c.name]));

  const trend: { label: string; count: number }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toDateString();
    trend.push({
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      count: recentDates.filter((r) => r.createdAt.toDateString() === key).length,
    });
  }

  return {
    stats: {
      total,
      pending: count("SUBMITTED") + count("UNDER_REVIEW"),
      inProgress: count("IN_PROGRESS"),
      resolved: count("RESOLVED") + count("CLOSED"),
    },
    statusData: STATUSES.map((s) => ({ key: s, name: STATUS_LABEL[s], value: count(s) })),
    priorityData: PRIORITIES.map((p) => ({
      name: PRIORITY_LABEL[p],
      value: byPriority.find((r) => r.priority === p)?._count._all ?? 0,
    })),
    categoryData: byCategory
      .map((c) => ({ name: catName.get(c.categoryId) ?? "Unknown", value: c._count._all }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8),
    trend,
    recent,
  };
}
