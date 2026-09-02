import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ImageViewer } from "@/components/ImageViewer";
import { StatusBadge } from "@/components/StatusBadge";
import { requireTenantUser } from "@/lib/auth-guards";
import { formatDisplayName, ROLE_LABELS, STATUS_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TenantTicketDetailPage({ params }: Props) {
  const user = await requireTenantUser();
  const { id } = await params;

  const ticket = await prisma.repairTicket.findFirst({
    where: {
      id,
      reporterId: user.id,
    },
    include: {
      statusLogs: {
        include: {
          changedBy: {
            select: {
              namePrefix: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <AppHeader user={user} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="animate-fade-up mb-6">
          <p className="text-sm text-[var(--bd-muted)]">
            <Link href="/dashboard" className="underline">
              ประวัติการแจ้งซ่อม
            </Link>{" "}
            / รายละเอียด
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--bd-ink)]">
              {ticket.title}
            </h1>
            <StatusBadge status={ticket.status} />
          </div>
          <p className="mt-1 text-sm text-[var(--bd-muted)]">
            รายละเอียดใบแจ้งซ่อมที่คุณส่งไว้
          </p>
        </div>

        <div className="animate-soft-in space-y-5 rounded-2xl bg-[var(--bd-surface)] p-6 shadow-[0_10px_30px_rgba(28,36,48,0.08)]">
          <section>
            <h2 className="text-sm font-semibold text-[var(--bd-ink)]">
              อาการชำรุด
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--bd-muted)]">
              {ticket.description}
            </p>
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <DetailItem label="ตำแหน่งสถานที่" value={ticket.location} />
            <DetailItem
              label="สถานะปัจจุบัน"
              value={STATUS_LABELS[ticket.status]}
            />
            <DetailItem
              label="วันที่แจ้ง"
              value={new Date(ticket.createdAt).toLocaleString("th-TH")}
            />
            <DetailItem
              label="อัปเดตล่าสุด"
              value={new Date(ticket.updatedAt).toLocaleString("th-TH")}
            />
          </section>

          {ticket.imagePath && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-[var(--bd-ink)]">
                รูปประกอบ
              </h2>
              <ImageViewer
                src={ticket.imagePath}
                alt={`รูปประกอบ: ${ticket.title}`}
                className="max-h-72 w-full rounded-xl object-contain"
              />
            </section>
          )}

          <section>
            <h2 className="text-sm font-semibold text-[var(--bd-ink)]">
              ความคืบหน้าสถานะ
            </h2>
            {ticket.statusLogs.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--bd-muted)]">
                ยังไม่มีประวัติการเปลี่ยนสถานะ
              </p>
            ) : (
              <ol className="mt-3 space-y-2">
                {ticket.statusLogs.map((log) => (
                  <li
                    key={log.id}
                    className="rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-3 text-sm"
                  >
                    <p className="font-medium text-[var(--bd-ink)]">
                      {log.fromStatus
                        ? `${STATUS_LABELS[log.fromStatus]} → ${STATUS_LABELS[log.toStatus]}`
                        : `สร้างใบงาน (${STATUS_LABELS[log.toStatus]})`}
                    </p>
                    <p className="mt-1 text-xs text-[var(--bd-muted)]">
                      โดย{" "}
                      {formatDisplayName(
                        log.changedBy.namePrefix,
                        log.changedBy.firstName,
                        log.changedBy.lastName,
                      )}{" "}
                      ({ROLE_LABELS[log.changedBy.role]}) ·{" "}
                      {new Date(log.createdAt).toLocaleString("th-TH")}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-3">
      <p className="text-xs text-[var(--bd-muted)]">{label}</p>
      <p className="mt-1 text-sm font-medium text-[var(--bd-ink)]">{value}</p>
    </div>
  );
}
