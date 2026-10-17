import type { Priority, Status } from "@prisma/client";
import { PRIORITY_LABEL, PRIORITY_STYLE, STATUS_LABEL, STATUS_STYLE } from "@/lib/constants";
import { cn } from "@/lib/utils";

const base = "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap";

export function StatusBadge({ status }: { status: Status }) {
  return <span className={cn(base, STATUS_STYLE[status])}>{STATUS_LABEL[status]}</span>;
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={cn(base, PRIORITY_STYLE[priority])}>{PRIORITY_LABEL[priority]}</span>;
}
