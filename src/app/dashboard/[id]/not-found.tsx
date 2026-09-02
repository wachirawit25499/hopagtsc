import Link from "next/link";

export default function TenantTicketNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-xl font-bold text-[var(--bd-ink)]">
        ไม่พบใบแจ้งซ่อม
      </h1>
      <p className="mt-2 text-sm text-[var(--bd-muted)]">
        ใบงานนี้อาจไม่มีอยู่ หรือไม่ใช่ของบัญชีคุณ
      </p>
      <Link
        href="/dashboard"
        className="mt-4 text-sm font-medium text-[var(--bd-accent)] underline"
      >
        กลับไปประวัติการแจ้งซ่อม
      </Link>
    </main>
  );
}
