import { AppHeader } from "@/components/AppHeader";
import { LineSettingsForm } from "@/components/LineSettingsForm";
import { requireAdminUser } from "@/lib/auth-guards";

export default async function AdminLinePage() {
  const user = await requireAdminUser();

  return (
    <div className="min-h-screen">
      <AppHeader user={user} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-fade-up mb-6">
          <h1 className="text-2xl font-bold text-[var(--bd-ink)]">
            แจ้งเตือนผ่าน LINE
          </h1>
          <p className="mt-1 text-sm text-[var(--bd-muted)]">
            ส่งข้อความเมื่อมีใบแจ้งซ่อมใหม่ หรือเมื่อเปลี่ยนสถานะงาน
          </p>
        </div>

        <ol className="animate-soft-in mb-6 list-decimal space-y-2 rounded-2xl bg-[var(--bd-surface)] px-8 py-5 text-sm text-[var(--bd-muted)] shadow-[0_8px_24px_rgba(28,36,48,0.06)]">
          <li>
            สร้าง LINE Official Account และ Messaging API channel ที่{" "}
            <a
              href="https://developers.line.biz/"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--bd-accent)] underline"
            >
              LINE Developers
            </a>
          </li>
          <li>คัดลอก Channel access token และ Channel secret มาวางด้านล่าง</li>
          <li>เปิด Allow bot to join group chats แล้วเชิญบอทเข้ากลุ่มช่าง/แอดมิน</li>
          <li>
            พิมพ์คำว่า <span className="font-medium text-[var(--bd-ink)]">ลงทะเบียน</span>{" "}
            ในกลุ่มนั้น ระบบจะผูกกลุ่มให้อัตโนมัติ
          </li>
        </ol>

        <div className="animate-soft-in rounded-2xl bg-[var(--bd-surface)] p-6 shadow-[0_10px_30px_rgba(28,36,48,0.08)]">
          <LineSettingsForm />
        </div>
      </main>
    </div>
  );
}
