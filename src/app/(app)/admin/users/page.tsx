import type { Metadata } from "next";
import { createUserAction, updateUserAction } from "@/actions/admin";
import { ActionForm, FieldError, SubmitButton } from "@/components/ui/ActionForm";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDay } from "@/lib/utils";

export const metadata: Metadata = { title: "Users & staff" };

export default async function AdminUsersPage() {
  const me = await requireUser(["ADMIN"]);
  const [users, departments] = await Promise.all([
    prisma.user.findMany({ orderBy: [{ role: "asc" }, { createdAt: "desc" }], include: { department: true, _count: { select: { submitted: true, assigned: true } } } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Users & staff</h1>
        <p className="text-slate-500">Create staff or admin accounts, change roles, assign departments and deactivate accounts.</p>
      </div>

      <ActionForm action={createUserAction} resetOnSuccess className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <h2 className="text-base font-semibold sm:col-span-2 lg:col-span-3">Add an account</h2>
        <div><label htmlFor="name" className="label">Full name</label><input id="name" name="name" required className="input" /><FieldError name="name" /></div>
        <div><label htmlFor="email" className="label">Email</label><input id="email" name="email" type="email" required className="input" /><FieldError name="email" /></div>
        <div><label htmlFor="password" className="label">Temporary password</label><input id="password" name="password" type="text" required autoComplete="off" className="input" /><FieldError name="password" /></div>
        <div>
          <label htmlFor="role" className="label">Role</label>
          <select id="role" name="role" defaultValue="STAFF" className="input"><option value="USER">User</option><option value="STAFF">Staff</option><option value="ADMIN">Admin</option></select>
        </div>
        <div>
          <label htmlFor="departmentId" className="label">Department</label>
          <select id="departmentId" name="departmentId" defaultValue="" className="input"><option value="">None</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        </div>
        <div className="flex items-end"><SubmitButton>Create account</SubmitButton></div>
      </ActionForm>

      <section className="card overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="border-b border-slate-200 dark:border-white/10">
            <tr><th className="th">Name</th><th className="th">Activity</th><th className="th">Joined</th><th className="th">Role, department & access</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {users.map((u) => (
              <tr key={u.id} className="align-top">
                <td className="td"><p className="font-medium">{u.name}{u.id === me.id && <span className="ml-2 text-xs text-slate-500">(you)</span>}</p><p className="text-xs text-slate-500">{u.email}</p></td>
                <td className="td text-slate-600 dark:text-slate-300">{u._count.submitted} filed · {u._count.assigned} assigned</td>
                <td className="td whitespace-nowrap text-slate-500">{formatDay(u.createdAt)}</td>
                <td className="td">
                  <ActionForm action={updateUserAction} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="userId" value={u.id} />
                    <select name="role" defaultValue={u.role} aria-label="Role" className="input w-auto py-1.5"><option value="USER">User</option><option value="STAFF">Staff</option><option value="ADMIN">Admin</option></select>
                    <select name="departmentId" defaultValue={u.departmentId ?? ""} aria-label="Department" className="input w-auto py-1.5"><option value="">No department</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
                    <select name="active" defaultValue={String(u.active)} aria-label="Access" className="input w-auto py-1.5"><option value="true">Active</option><option value="false">Deactivated</option></select>
                    <SubmitButton variant="outline" className="py-1.5">Save</SubmitButton>
                  </ActionForm>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
