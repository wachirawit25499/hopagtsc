import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { requireAdminUser } from "@/lib/auth-guards";
import { formatDisplayName, ROLE_LABELS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export default async function AdminDatabasePage() {
  const user = await requireAdminUser();

  const [users, tickets] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
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
        createdAt: true,
        _count: { select: { tickets: true } },
      },
    }),
    prisma.repairTicket.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: {
          select: {
            namePrefix: true,
            firstName: true,
            lastName: true,
            tenantCode: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="min-h-screen">
      <AppHeader user={user} />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="animate-fade-up mb-8">
          <h1 className="text-2xl font-bold text-[var(--bd-ink)]">
            จัดการฐานข้อมูล
          </h1>
          <p className="mt-1 text-sm text-[var(--bd-muted)]">
            ดูและแก้ไขข้อมูลผู้ใช้กับใบแจ้งซ่อม (เฉพาะผู้ดูแลระบบ)
          </p>
        </div>

        <section className="animate-soft-in mb-10">
          <div className="mb-3 flex items-end justify-between gap-3">
            <h2 className="text-lg font-semibold text-[var(--bd-ink)]">
              ตาราง User ({users.length})
            </h2>
          </div>
          <div className="overflow-x-auto rounded-2xl bg-[var(--bd-surface)] shadow-[0_8px_24px_rgba(28,36,48,0.06)]">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--bd-line)] text-xs text-[var(--bd-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">รหัส</th>
                  <th className="px-4 py-3 font-medium">ชื่อ</th>
                  <th className="px-4 py-3 font-medium">เบอร์โทร</th>
                  <th className="px-4 py-3 font-medium">หอพัก</th>
                  <th className="px-4 py-3 font-medium">ห้อง</th>
                  <th className="px-4 py-3 font-medium">บทบาท</th>
                  <th className="px-4 py-3 font-medium">จำนวน</th>
                  <th className="px-4 py-3 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[var(--bd-line)]/70 last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--bd-ink)]">
                      {row.tenantCode}
                    </td>
                    <td className="px-4 py-3">
                      {formatDisplayName(
                        row.namePrefix,
                        row.firstName,
                        row.lastName,
                      )}
                    </td>
                    <td className="px-4 py-3">{row.phoneNumber ?? "-"}</td>
                    <td className="px-4 py-3">{row.dormitory ?? "-"}</td>
                    <td className="px-4 py-3">{row.roomNumber ?? "-"}</td>
                    <td className="px-4 py-3">{ROLE_LABELS[row.role]}</td>
                    <td className="px-4 py-3">{row._count.tickets}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/database/users/${row.id}`}
                        className="font-medium text-[var(--bd-accent)] underline"
                      >
                        แก้ไข
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="animate-soft-in">
          <h2 className="mb-3 text-lg font-semibold text-[var(--bd-ink)]">
            ตาราง RepairTicket ({tickets.length})
          </h2>
          <div className="overflow-x-auto rounded-2xl bg-[var(--bd-surface)] shadow-[0_8px_24px_rgba(28,36,48,0.06)]">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--bd-line)] text-xs text-[var(--bd-muted)]">
                <tr>
                  <th className="px-4 py-3 font-medium">หัวข้อ</th>
                  <th className="px-4 py-3 font-medium">ผู้แจ้ง</th>
                  <th className="px-4 py-3 font-medium">สถานที่</th>
                  <th className="px-4 py-3 font-medium">สถานะ</th>
                  <th className="px-4 py-3 font-medium">วันที่</th>
                  <th className="px-4 py-3 font-medium">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-[var(--bd-muted)]"
                    >
                      ยังไม่มีใบแจ้งซ่อมในฐานข้อมูล
                    </td>
                  </tr>
                ) : (
                  tickets.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--bd-line)]/70 last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-[var(--bd-ink)]">
                        {row.title}
                      </td>
                      <td className="px-4 py-3">
                        {formatDisplayName(
                          row.reporter.namePrefix,
                          row.reporter.firstName,
                          row.reporter.lastName,
                        )}
                        <span className="block text-xs text-[var(--bd-muted)]">
                          {row.reporter.tenantCode}
                        </span>
                      </td>
                      <td className="px-4 py-3">{row.location}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--bd-muted)]">
                        {new Date(row.createdAt).toLocaleString("th-TH")}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/database/repairs/${row.id}`}
                          className="font-medium text-[var(--bd-accent)] underline"
                        >
                          แก้ไข
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
