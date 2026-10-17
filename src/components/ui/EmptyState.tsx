import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-white/5">
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <div className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{children}</div>
    </div>
  );
}
