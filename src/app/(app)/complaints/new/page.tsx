import type { Metadata } from "next";
import { createComplaintAction } from "@/actions/complaints";
import { ActionForm, FieldError, SubmitButton } from "@/components/ui/ActionForm";
import { PRIORITIES, PRIORITY_LABEL } from "@/lib/constants";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "New complaint" };

export default async function NewComplaintPage() {
  await requireUser(["USER"]);
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold">New complaint</h1>
      <p className="mt-1 text-slate-500">Tell us what’s wrong. You’ll get a complaint ID to track it.</p>

      <ActionForm action={createComplaintAction} className="card mt-6 space-y-5 p-6">
        <div>
          <label htmlFor="title" className="label">Title</label>
          <input id="title" name="title" required maxLength={120} placeholder="e.g. Wi-Fi keeps dropping in Block C" className="input" />
          <FieldError name="title" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="categoryId" className="label">Category</label>
            <select id="categoryId" name="categoryId" required defaultValue="" className="input">
              <option value="" disabled>Select a category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <FieldError name="categoryId" />
          </div>
          <div>
            <label htmlFor="priority" className="label">Priority</label>
            <select id="priority" name="priority" defaultValue="MEDIUM" className="input">
              {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
            </select>
            <FieldError name="priority" />
          </div>
        </div>
        <div>
          <label htmlFor="description" className="label">What happened?</label>
          <textarea id="description" name="description" rows={6} required maxLength={2000} placeholder="Include where, when and how often it happens." className="input" />
          <FieldError name="description" />
        </div>
        <SubmitButton>Submit complaint</SubmitButton>
      </ActionForm>
    </div>
  );
}
