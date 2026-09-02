import { AppHeader } from "@/components/AppHeader";
import { TicketList } from "@/components/TicketList";
import { requireStaffUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";

export default async function RequestsPage() {
  const user = await requireStaffUser();

  const tickets = await prisma.repairTicket.findMany({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS"] },
    },
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
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen">
      <AppHeader user={user} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="animate-fade-up mb-6">
          <h1 className="text-2xl font-bold text-[var(--bd-ink)]">
            คำขอแจ้งซ่อม
          </h1>
          <p className="mt-1 text-sm text-[var(--bd-muted)]">
            ใบงานที่รอดำเนินการหรือกำลังซ่อม — กดดูรายละเอียดเต็มหรืออัปเดตสถานะ
          </p>
        </div>
        <TicketList
          tickets={tickets}
          canManage
          detailBasePath="/requests"
          emptyText="ยังไม่มีคำขอแจ้งซ่อมที่ต้องดำเนินการ"
        />
      </main>
    </div>
  );
}
