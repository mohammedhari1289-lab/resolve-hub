"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell, Building2, FilePlus2, FileText, LayoutDashboard, LogOut, Menu, Search, Tags, Users, X, type LucideIcon,
} from "lucide-react";
import type { Role } from "@prisma/client";
import { logoutAction } from "@/actions/auth";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

type Item = { href: string; label: string; icon: LucideIcon; roles: Role[] };

function navFor(role: Role): Item[] {
  const listLabel = role === "USER" ? "My complaints" : role === "STAFF" ? "Assigned to me" : "All complaints";
  const all: Item[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["USER", "STAFF", "ADMIN"] },
    { href: "/complaints/new", label: "New complaint", icon: FilePlus2, roles: ["USER"] },
    { href: "/complaints", label: listLabel, icon: FileText, roles: ["USER", "STAFF", "ADMIN"] },
    { href: "/admin/users", label: "Users & staff", icon: Users, roles: ["ADMIN"] },
    { href: "/admin/categories", label: "Categories", icon: Tags, roles: ["ADMIN"] },
    { href: "/admin/departments", label: "Departments", icon: Building2, roles: ["ADMIN"] },
    { href: "/notifications", label: "Notifications", icon: Bell, roles: ["USER", "STAFF", "ADMIN"] },
  ];
  return all.filter((i) => i.roles.includes(role));
}

function isActive(pathname: string, href: string) {
  if (href === "/complaints") return pathname === "/complaints" || (pathname.startsWith("/complaints/") && !pathname.startsWith("/complaints/new"));
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppShell({
  user,
  unread,
  children,
}: {
  user: { name: string; email: string; role: Role };
  unread: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = navFor(user.role);

  useEffect(() => setOpen(false), [pathname]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo href="/dashboard" className="text-white" />
        <button className="text-slate-400 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main">
        {items.map((i) => {
          const active = isActive(pathname, i.href);
          return (
            <Link
              key={i.href}
              href={i.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-brand-600 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <i.icon className="h-[18px] w-[18px]" aria-hidden />
              <span className="flex-1">{i.label}</span>
              {i.href === "/notifications" && unread > 0 && (
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-ink-950">{unread}</span>
              )}
            </Link>
          );
        })}
        <Link href="/track" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white">
          <Search className="h-[18px] w-[18px]" aria-hidden /> Track by ID
        </Link>
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-medium text-white">{user.name}</p>
        <p className="truncate text-xs text-slate-400">{user.email}</p>
        <span className="mt-2 inline-block rounded bg-white/10 px-2 py-0.5 text-xs text-brand-200">{user.role === "USER" ? "User" : user.role === "STAFF" ? "Staff" : "Admin"}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 bg-ink-900 lg:block">{sidebar}</aside>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
      <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-ink-900 transition-transform lg:hidden", open ? "translate-x-0" : "-translate-x-full")}>{sidebar}</aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b border-slate-200 bg-[#f5f7f6]/90 px-4 backdrop-blur dark:border-white/10 dark:bg-ink-950/90 sm:px-8">
          <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-slate-200/70 dark:hover:bg-white/10 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          <ThemeToggle />
          <Link href="/notifications" className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-white/10" aria-label={`Notifications (${unread} unread)`}>
            <Bell className="h-[18px] w-[18px]" />
            {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-[#f5f7f6] dark:ring-ink-950" />}
          </Link>
          <form action={logoutAction}>
            <button className="btn-outline px-3 py-1.5" type="submit">
              <LogOut className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
