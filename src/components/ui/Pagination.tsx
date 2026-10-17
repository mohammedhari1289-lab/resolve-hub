import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ page, pages, params }: { page: number; pages: number; params: Record<string, string | undefined> }) {
  if (pages <= 1) return null;
  const href = (p: number) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => v && q.set(k, v));
    q.set("page", String(p));
    return `/complaints?${q.toString()}`;
  };
  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm dark:border-white/10">
      <span className="text-slate-500">Page {page} of {pages}</span>
      <div className="flex gap-2">
        {page > 1 && <Link href={href(page - 1)} className="btn-outline px-3 py-1.5"><ChevronLeft className="h-4 w-4" />Previous</Link>}
        {page < pages && <Link href={href(page + 1)} className="btn-outline px-3 py-1.5">Next<ChevronRight className="h-4 w-4" /></Link>}
      </div>
    </div>
  );
}
