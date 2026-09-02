import Link from "next/link";

export default function RequestNotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-xl font-bold text-[var(--bd-ink)]">ไม่พบคำขอแจ้งซ่อม</h1>
      <p className="mt-2 text-sm text-[var(--bd-muted)]">
        ใบงานนี้อาจถูกปิดแล้วหรือไม่มีในระบบ
      </p>
      <Link
        href="/requests"
        className="mt-4 text-sm font-medium text-[var(--bd-accent)] underline"
      >
        กลับไปคำขอแจ้งซ่อม
      </Link>
    </main>
  );
}
