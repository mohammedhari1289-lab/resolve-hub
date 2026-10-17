import { z } from "zod";

const email = z.string().trim().toLowerCase().email("Enter a valid email address");
const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use at most 72 characters")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");
const name = z.string().trim().min(2, "Enter your full name").max(60, "Name is too long");

export const registerSchema = z
  .object({ name, email, password, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export const loginSchema = z.object({ email, password: z.string().min(1, "Enter your password") });

export const complaintSchema = z.object({
  title: z.string().trim().min(5, "Title needs at least 5 characters").max(120, "Title is too long"),
  description: z.string().trim().min(20, "Describe the issue in at least 20 characters").max(2000, "Description is too long"),
  categoryId: z.string().min(1, "Select a category"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"], { message: "Select a priority" }),
});

export const statusSchema = z.object({
  ticketId: z.string().min(1),
  status: z.enum(["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
  remark: z.string().trim().max(1000, "Remark is too long").optional(),
});

export const assignSchema = z.object({ ticketId: z.string().min(1), staffId: z.string().optional() });

export const adminUserSchema = z.object({
  name,
  email,
  password,
  role: z.enum(["USER", "STAFF", "ADMIN"]),
  departmentId: z.string().optional(),
});

export const updateUserSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "STAFF", "ADMIN"]),
  departmentId: z.string().optional(),
  active: z.enum(["true", "false"]),
});

export const nameDescSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(60, "Name is too long"),
  description: z.string().trim().max(200, "Keep it under 200 characters").optional(),
  departmentId: z.string().optional(),
});
