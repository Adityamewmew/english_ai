import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { userService } from "@/services/user.service";
import { UserForm } from "@/components/admin/user-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Edit Pengguna | Admin EDDY'S AI",
};

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await userService.getById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const user = result.data;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/users" className="hover:text-primary transition">
          Manajemen Pengguna
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-800">Edit Pengguna</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Data Pengguna</CardTitle>
          <CardDescription>
            Perbarui informasi nama, email, role, atau level CEFR pengguna ({user.name}).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm
            mode="edit"
            initialData={{
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              currentCefr: user.currentCefr,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
