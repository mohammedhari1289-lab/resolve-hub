"use server";

import bcrypt from "bcryptjs";
import type { ZodError } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { adminUserSchema, nameDescSchema, updateUserSchema } from "@/lib/validators";
import type { FormState } from "@/lib/types";

const invalid = (e: ZodError): FormState => ({
  message: "Please fix the highlighted fields.",
  errors: e.flatten().fieldErrors,
});

export async function createUserAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireUser(["ADMIN"]);
  const p = adminUserSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return invalid(p.error);
  const { name, email, password, role, departmentId } = p.data;
  if (await prisma.user.findUnique({ where: { email } })) return { message: "That email is already registered.", errors: { email: ["Email already in use"] } };
  await prisma.user.create({
    data: { name, email, role, departmentId: departmentId || null, passwordHash: await bcrypt.hash(password, 12) },
  });
  revalidatePath("/admin/users");
  return { ok: true, message: `${role === "STAFF" ? "Staff member" : "User"} created.` };
}

export async function updateUserAction(_: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireUser(["ADMIN"]);
  const p = updateUserSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { message: "Invalid request." };
  const { userId, role, departmentId, active } = p.data;
  if (userId === admin.id && (role !== "ADMIN" || active === "false")) {
    return { message: "You cannot remove your own admin access or deactivate yourself." };
  }
  await prisma.user.update({ where: { id: userId }, data: { role, active: active === "true", departmentId: departmentId || null } });
  revalidatePath("/admin/users");
  return { ok: true, message: "User updated." };
}

export async function createCategoryAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireUser(["ADMIN"]);
  const p = nameDescSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return invalid(p.error);
  const { name, description, departmentId } = p.data;
  if (await prisma.category.findUnique({ where: { name } })) return { message: "A category with this name already exists.", errors: { name: ["Name already used"] } };
  await prisma.category.create({ data: { name, description: description || null, departmentId: departmentId || null } });
  revalidatePath("/admin/categories");
  revalidatePath("/complaints/new");
  return { ok: true, message: "Category created." };
}

export async function deleteCategoryAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireUser(["ADMIN"]);
  const id = String(fd.get("id") ?? "");
  const used = await prisma.complaint.count({ where: { categoryId: id } });
  if (used > 0) return { message: `Cannot delete: ${used} complaint(s) use this category.` };
  await prisma.category.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/categories");
  return { ok: true, message: "Category deleted." };
}

export async function createDepartmentAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireUser(["ADMIN"]);
  const p = nameDescSchema.safeParse(Object.fromEntries(fd));
  if (!p.success) return invalid(p.error);
  const { name, description } = p.data;
  if (await prisma.department.findUnique({ where: { name } })) return { message: "A department with this name already exists.", errors: { name: ["Name already used"] } };
  await prisma.department.create({ data: { name, description: description || null } });
  revalidatePath("/admin/departments");
  return { ok: true, message: "Department created." };
}

export async function deleteDepartmentAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireUser(["ADMIN"]);
  const id = String(fd.get("id") ?? "");
  await prisma.department.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/departments");
  revalidatePath("/admin/users");
  return { ok: true, message: "Department deleted. Linked staff and categories were unlinked." };
}
