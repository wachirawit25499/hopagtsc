import { AppHeader } from "@/components/AppHeader";
import { HistoryByDormitory } from "@/components/HistoryByDormitory";
import { requireStaffUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export default async function HistoryPage() {
  const user = await requireStaffUser();

  const tickets = await prisma.repairTicket.findMany({
    where: { status: "COMPLETED" },
    include: {
      reporter: {
        select: {
          namePrefix: true,
          firstName: true,
          lastName: true,
          dormitory: true,
          roomNumber: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen">
      <AppHeader user={user} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="animate-fade-up mb-6">
          <h1 className="text-2xl font-bold text-[var(--bd-ink)]">
            ประวัติการแจ้งซ่อม
          </h1>
          <p className="mt-1 text-sm text-[var(--bd-muted)]">
            ใบงานที่เสร็จสิ้นแล้ว — เลือกหอพักจากดรอปดาวน์เพื่อกรองรายการ
            {user.role === "ADMIN"
              ? " ผู้ดูแลระบบสามารถแก้ไขหรือลบประวัติได้"
              : ""}
          </p>
        </div>

        <HistoryByDormitory
          tickets={tickets}
          isAdmin={user.role === "ADMIN"}
        />
      </main>
    </div>
  );
}
