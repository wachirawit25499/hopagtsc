import Link from "next/link";
import { notFound } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { ImageViewer } from "@/components/ImageViewer";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusSelect } from "@/components/StatusSelect";
import { requireStaffUser } from "@/lib/auth-guards";
import { formatDisplayName, ROLE_LABELS, STATUS_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function RequestDetailPage({ params }: Props) {
  const user = await requireStaffUser();
  const { id } = await params;

  const ticket = await prisma.repairTicket.findUnique({
    where: { id },
    include: {
      reporter: {
        select: {
          namePrefix: true,
          firstName: true,
          lastName: true,
          tenantCode: true,
          phoneNumber: true,
          dormitory: true,
          roomNumber: true,
        },
      },
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

  const isOpen =
    ticket.status === "PENDING" || ticket.status === "IN_PROGRESS";
  const backHref = isOpen ? "/requests" : "/history";
  const backLabel = isOpen ? "คำขอแจ้งซ่อม" : "ประวัติการแจ้งซ่อม";

  return (
    <div className="min-h-screen">
      <AppHeader user={user} />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="animate-fade-up mb-6">
          <p className="text-sm text-[var(--bd-muted)]">
            <Link href={backHref} className="underline">
              {backLabel}
            </Link>{" "}
            / รายละเอียด
          </p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-[var(--bd-ink)]">
                  {ticket.title}
                </h1>
                <StatusBadge status={ticket.status} />
              </div>
              <p className="mt-1 text-sm text-[var(--bd-muted)]">
                รายละเอียดใบแจ้งซ่อมฉบับเต็ม
              </p>
            </div>
            {isOpen && (
              <StatusSelect ticketId={ticket.id} current={ticket.status} />
            )}
          </div>
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
              label="ผู้แจ้ง"
              value={formatDisplayName(
                ticket.reporter.namePrefix,
                ticket.reporter.firstName,
                ticket.reporter.lastName,
              )}
            />
            <DetailItem
              label="รหัสประจำตัว"
              value={ticket.reporter.tenantCode}
            />
            <DetailItem
              label="เบอร์โทร"
              value={ticket.reporter.phoneNumber ?? "-"}
            />
            <DetailItem
              label="หอพัก"
              value={ticket.reporter.dormitory ?? "-"}
            />
            <DetailItem
              label="หมายเลขห้อง"
              value={ticket.reporter.roomNumber ?? "-"}
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
              ประวัติสถานะ (ฐานข้อมูล)
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
                      {log.note ? ` · ${log.note}` : ""}
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
