import type { Priority, Status } from "@prisma/client";

export const STATUSES: Status[] = ["SUBMITTED", "UNDER_REVIEW", "IN_PROGRESS", "RESOLVED", "CLOSED"];
export const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export const STATUS_LABEL: Record<Status, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

export const STATUS_COLOR: Record<Status, string> = {
  SUBMITTED: "#94a3b8",
  UNDER_REVIEW: "#e8a33d",
  IN_PROGRESS: "#3b82f6",
  RESOLVED: "#10b981",
  CLOSED: "#7c6fd6",
};

export const STATUS_STYLE: Record<Status, string> = {
  SUBMITTED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  UNDER_REVIEW: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  RESOLVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  CLOSED: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
};

export const PRIORITY_STYLE: Record<Priority, string> = {
  LOW: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  MEDIUM: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
  URGENT: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
};
