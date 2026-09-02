import { AppHeader } from "@/components/AppHeader";
import { TicketList } from "@/components/TicketList";
import { homePathForRole, isStaff, requireAuthUser } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await requireAuthUser();

  if (isStaff(user)) {
    redirect(homePathForRole(user.role));
  }

  const tickets = await prisma.repairTicket.findMany({
    where: { reporterId: user.id },
    include: {
      reporter: {
        select: {
          firstName: true,
          lastName: true,
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
            ประวัติการแจ้งซ่อม
          </h1>
          <p className="mt-1 text-sm text-[var(--bd-muted)]">
            รายการที่คุณแจ้งไว้ — กดดูรายละเอียดและติดตามสถานะได้
          </p>
        </div>

        {tickets.length === 0 ? (
          <div className="animate-soft-in rounded-2xl border border-dashed border-[var(--bd-line)] bg-[var(--bd-surface)]/70 px-6 py-16 text-center">
            <p className="text-[var(--bd-muted)]">ยังไม่มีประวัติการแจ้งซ่อม</p>
            <p className="mt-2 text-sm text-[var(--bd-muted)]">
              กดเมนู &quot;แจ้งซ่อมใหม่&quot; ด้านบนเพื่อเริ่มต้น
            </p>
          </div>
        ) : (
          <TicketList
            tickets={tickets}
            canManage={false}
            detailBasePath="/dashboard"
            emptyText="ยังไม่มีประวัติการแจ้งซ่อม"
          />
        )}
      </main>
    </div>
  );
}
