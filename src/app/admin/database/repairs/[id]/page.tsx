import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminRepairEditForm } from "@/components/AdminRepairEditForm";
import { AppHeader } from "@/components/AppHeader";
import { requireAdminUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

type Props = { params: Promise<{ id: string }> };

export default async function AdminEditRepairPage({ params }: Props) {
  const admin = await requireAdminUser();
  const { id } = await params;

  const ticket = await prisma.repairTicket.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      imagePath: true,
      status: true,
    },
  });

  if (!ticket) {
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
            / แก้ไขใบแจ้งซ่อม
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--bd-ink)]">
            แก้ไขข้อมูล RepairTicket
          </h1>
        </div>
        <div className="animate-soft-in rounded-2xl bg-[var(--bd-surface)] p-6 shadow-[0_10px_30px_rgba(28,36,48,0.08)]">
          <AdminRepairEditForm ticket={ticket} />
        </div>
      </main>
    </div>
  );
}
