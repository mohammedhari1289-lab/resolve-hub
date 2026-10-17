import { prisma } from "./prisma";

/** Creates in-app notifications for a set of users (de-duplicated, optionally excluding the actor). */
export async function notify(userIds: (string | null | undefined)[], message: string, link?: string, excludeId?: string) {
  const ids = Array.from(new Set(userIds.filter((x): x is string => !!x && x !== excludeId)));
  if (!ids.length) return;
  await prisma.notification.createMany({ data: ids.map((userId) => ({ userId, message, link })) });
}

export async function adminIds() {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN", active: true }, select: { id: true } });
  return admins.map((a) => a.id);
}
