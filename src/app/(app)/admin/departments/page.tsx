import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { createDepartmentAction, deleteDepartmentAction } from "@/actions/admin";
import { ActionForm, FieldError, SubmitButton } from "@/components/ui/ActionForm";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Departments" };

export default async function AdminDepartmentsPage() {
  await requireUser(["ADMIN"]);
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true, categories: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Departments</h1>
        <p className="text-slate-500">Departments group staff and categories so complaints reach the right team.</p>
      </div>

      <ActionForm action={createDepartmentAction} resetOnSuccess className="card grid gap-4 p-5 sm:grid-cols-3">
        <div><label htmlFor="name" className="label">Name</label><input id="name" name="name" required className="input" /><FieldError name="name" /></div>
        <div><label htmlFor="description" className="label">Description</label><input id="description" name="description" className="input" /><FieldError name="description" /></div>
        <div className="flex items-end"><SubmitButton>Add department</SubmitButton></div>
      </ActionForm>

      <section className="card overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-slate-200 dark:border-white/10"><tr><th className="th">Department</th><th className="th">Staff & users</th><th className="th">Categories</th><th className="th" /></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {departments.map((d) => (
              <tr key={d.id}>
                <td className="td"><p className="font-medium">{d.name}</p><p className="text-xs text-slate-500">{d.description}</p></td>
                <td className="td">{d._count.users}</td>
                <td className="td">{d._count.categories}</td>
                <td className="td text-right">
                  <ActionForm action={deleteDepartmentAction}>
                    <input type="hidden" name="id" value={d.id} />
                    <SubmitButton variant="danger" className="py-1.5"><Trash2 className="h-4 w-4" aria-hidden />Delete</SubmitButton>
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
