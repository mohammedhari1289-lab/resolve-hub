import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({ label, value, icon: Icon, tone }: { label: string; value: number; icon: LucideIcon; tone: string }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-lg", tone)}>
        <Icon className="h-5 w-5" aria-hidden />
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-display text-3xl font-bold leading-tight">{value}</p>
      </div>
    </div>
  );
}
