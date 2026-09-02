import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminUserEditForm } from "@/components/AdminUserEditForm";
import { AppHeader } from "@/components/AppHeader";
import { requireAdminUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditUserPage({ params }: Props) {
  const admin = await requireAdminUser();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      tenantCode: true,
      namePrefix: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      dormitory: true,
      roomNumber: true,
      role: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <AppHeader user={admin} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-fade-up mb-6">
          <p className="text-sm text-[var(--bd-muted)]">
            <Link href="/admin/database" className="underline">
              จัดการฐานข้อมูล
            </Link>{" "}
            / แก้ไขผู้ใช้
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--bd-ink)]">
            แก้ไขข้อมูล User
          </h1>
        </div>
        <div className="animate-soft-in rounded-2xl bg-[var(--bd-surface)] p-6 shadow-[0_10px_30px_rgba(28,36,48,0.08)]">
          <AdminUserEditForm user={user} />
        </div>
      </main>
    </div>
  );
}
