"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { generateTicketId } from "@/lib/ids";
import { adminIds, notify } from "@/lib/notify";
import { STATUS_LABEL } from "@/lib/constants";
import { assignSchema, complaintSchema, statusSchema } from "@/lib/validators";
import type { FormState } from "@/lib/types";

function refresh(ticketId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/complaints");
  revalidatePath("/notifications");
  if (ticketId) revalidatePath(`/complaints/${ticketId}`);
}

export async function createComplaintAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser(["USER"]);
  const parsed = complaintSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { message: "Please fix the highlighted fields.", errors: parsed.error.flatten().fieldErrors };

  const { title, description, categoryId, priority } = parsed.data;
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { message: "That category no longer exists.", errors: { categoryId: ["Select a valid category"] } };

  let ticketId = generateTicketId();
  for (let i = 0; i < 5 && (await prisma.complaint.findUnique({ where: { ticketId } })); i++) ticketId = generateTicketId();

  await prisma.complaint.create({
    data: {
      ticketId,
      title,
      description,
      priority,
      categoryId,
      userId: user.id,
      history: { create: { actorId: user.id, toStatus: "SUBMITTED", remark: "Complaint submitted" } },
    },
  });

  await notify(await adminIds(), `New complaint ${ticketId}: “${title}”.`, `/complaints/${ticketId}`);
  refresh();
  redirect(`/complaints/${ticketId}?created=1`);
}

const STAFF_ALLOWED = ["UNDER_REVIEW", "IN_PROGRESS", "RESOLVED"];

export async function updateStatusAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = statusSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { message: "Please fix the highlighted fields.", errors: parsed.error.flatten().fieldErrors };

  const { ticketId, status, remark } = parsed.data;
  const c = await prisma.complaint.findUnique({ where: { ticketId } });
  if (!c) return { message: "Complaint not found." };

  // Server-side permission matrix
  let allowed = false;
  if (user.role === "ADMIN") allowed = true;
  else if (user.role === "STAFF") allowed = c.assignedToId === user.id && STAFF_ALLOWED.includes(status);
  else allowed = c.userId === user.id && c.status === "RESOLVED" && status === "CLOSED";
  if (!allowed) return { message: "You are not allowed to make this update." };

  if (status === c.status && !remark) return { message: "Change the status or add a remark." };
  if (status === "RESOLVED" && !remark) return { message: "Add a resolution note before resolving.", errors: { remark: ["Resolution note is required"] } };

  await prisma.$transaction([
    prisma.complaint.update({
      where: { id: c.id },
      data: {
        status,
        ...(status === "RESOLVED" ? { resolvedAt: new Date(), resolution: remark } : {}),
      },
    }),
    prisma.complaintHistory.create({
      data: { complaintId: c.id, actorId: user.id, fromStatus: c.status, toStatus: status, remark: remark || null },
    }),
  ]);

  const msg =
    status === c.status
      ? `New remark on ${ticketId}.`
      : `Complaint ${ticketId} is now ${STATUS_LABEL[status]}.`;
  await notify([c.userId, c.assignedToId], msg, `/complaints/${ticketId}`, user.id);
  refresh(ticketId);
  return { ok: true, message: status === c.status ? "Remark added." : `Status updated to ${STATUS_LABEL[status]}.` };
}

export async function assignComplaintAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireUser(["ADMIN"]);
  const parsed = assignSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { message: "Invalid request." };

  const { ticketId, staffId } = parsed.data;
  const c = await prisma.complaint.findUnique({ where: { ticketId } });
  if (!c) return { message: "Complaint not found." };

  let staffName = "nobody";
  if (staffId) {
    const staff = await prisma.user.findFirst({ where: { id: staffId, role: "STAFF", active: true } });
    if (!staff) return { message: "Select an active staff member." };
    staffName = staff.name;
  }

  await prisma.$transaction([
    prisma.complaint.update({ where: { id: c.id }, data: { assignedToId: staffId || null } }),
    prisma.complaintHistory.create({
      data: {
        complaintId: c.id,
        actorId: admin.id,
        fromStatus: c.status,
        toStatus: c.status,
        remark: staffId ? `Assigned to ${staffName}` : "Assignment removed",
      },
    }),
  ]);

  if (staffId) await notify([staffId], `You were assigned complaint ${ticketId}.`, `/complaints/${ticketId}`);
  await notify([c.userId], `Complaint ${ticketId} was assigned to ${staffName}.`, `/complaints/${ticketId}`);
  refresh(ticketId);
  return { ok: true, message: staffId ? `Assigned to ${staffName}.` : "Assignment removed." };
}

export async function markNotificationsReadAction(): Promise<FormState> {
  const user = await requireUser();
  await prisma.notification.updateMany({ where: { userId: user.id, read: false }, data: { read: true } });
  revalidatePath("/notifications");
  revalidatePath("/dashboard");
  return { ok: true, message: "All notifications marked as read." };
}
