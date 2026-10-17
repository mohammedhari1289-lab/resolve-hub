import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { createCategoryAction, deleteCategoryAction } from "@/actions/admin";
import { ActionForm, FieldError, SubmitButton } from "@/components/ui/ActionForm";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireUser(["ADMIN"]);
  const [categories, departments] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, include: { department: true, _count: { select: { complaints: true } } } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-slate-500">Categories appear in the complaint form and are linked to the department that usually handles them.</p>
      </div>

      <ActionForm action={createCategoryAction} resetOnSuccess className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div><label htmlFor="name" className="label">Name</label><input id="name" name="name" required className="input" /><FieldError name="name" /></div>
        <div><label htmlFor="description" className="label">Description</label><input id="description" name="description" className="input" /><FieldError name="description" /></div>
        <div>
          <label htmlFor="departmentId" className="label">Department</label>
          <select id="departmentId" name="departmentId" defaultValue="" className="input"><option value="">None</option>{departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        </div>
        <div className="flex items-end"><SubmitButton>Add category</SubmitButton></div>
      </ActionForm>

      <section className="card overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-slate-200 dark:border-white/10"><tr><th className="th">Category</th><th className="th">Department</th><th className="th">Complaints</th><th className="th" /></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {categories.map((c) => (
              <tr key={c.id}>
                <td className="td"><p className="font-medium">{c.name}</p><p className="text-xs text-slate-500">{c.description}</p></td>
                <td className="td">{c.department?.name ?? "—"}</td>
                <td className="td">{c._count.complaints}</td>
                <td className="td text-right">
                  <ActionForm action={deleteCategoryAction}>
                    <input type="hidden" name="id" value={c.id} />
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
