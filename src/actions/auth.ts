"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validators";
import { clearFailures, isLimited, recordFailure } from "@/lib/ratelimit";
import type { FormState } from "@/lib/types";

// Used to keep response time similar whether or not the email exists.
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8.3b5G6x1h4m8l2m2B3gq0n2p1u0yC";

export async function registerAction(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { message: "Please fix the highlighted fields.", errors: parsed.error.flatten().fieldErrors };

  const { name, email, password } = parsed.data;
  if (await prisma.user.findUnique({ where: { email } })) {
    return { message: "An account with this email already exists.", errors: { email: ["Email is already registered"] } };
  }
  // Public sign-up ALWAYS creates a USER. Staff/Admin accounts are created by an admin.
  const user = await prisma.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 12) } });
  await createSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { message: "Please fix the highlighted fields.", errors: parsed.error.flatten().fieldErrors };

  const { email, password } = parsed.data;
  if (isLimited(email)) return { message: "Too many failed attempts. Try again in 15 minutes." };

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid || !user.active) {
    recordFailure(email);
    return { message: "Incorrect email or password." };
  }
  clearFailures(email);
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  destroySession();
  redirect("/login");
}
