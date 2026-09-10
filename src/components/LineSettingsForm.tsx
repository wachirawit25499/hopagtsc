"use client";

import { FormEvent, useEffect, useState } from "react";

type LineDiagnostics = {
  enabled: boolean;
  hasToken: boolean;
  hasSecret: boolean;
  targetCount: number;
  tokenOk: boolean;
  tokenDetail: string;
  lastWebhook: string;
  ready: boolean;
};

type LineConfig = {
  enabled: boolean;
  hasToken: boolean;
  hasSecret: boolean;
  tokenMasked: string;
  secretMasked: string;
  targets: string[];
  diagnostics: LineDiagnostics;
};

function StatusRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className={ok ? "text-[var(--bd-done)]" : "text-[#b45252]"}>
        {ok ? "✓" : "✗"}
      </span>
      <span>{label}</span>
    </li>
  );
}

export function LineSettingsForm() {
  const [token, setToken] = useState("");
  const [secret, setSecret] = useState("");
  const [targets, setTargets] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [config, setConfig] = useState<LineConfig | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/line/webhook`
      : "/api/line/webhook";

  async function load() {
    const res = await fetch("/api/admin/line", { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "โหลดการตั้งค่าไม่สำเร็จ");
      return;
    }
    setConfig(data as LineConfig);
    setTargets((data.targets as string[]).join("\n"));
    setEnabled(Boolean(data.enabled));
  }

  useEffect(() => {
    void load();
  }, []);

  async function save(test: boolean) {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/line", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          secret,
          targets,
          enabled,
          test,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      setToken("");
      setSecret("");
      await load();
      if (test) {
        const result = data.testResult as
          | {
              sent?: number;
              skipped?: boolean;
              errors?: string[];
              reason?: string;
            }
          | undefined;
        if (result?.skipped) {
          setError(
            result.reason ??
              "ยังส่งทดสอบไม่ได้ — กรอก Channel access token และผูกกลุ่ม LINE ก่อน",
          );
        } else if (result?.errors?.length) {
          setError(result.errors[0] ?? "ส่งข้อความทดสอบไม่สำเร็จ");
        } else {
          setSuccess(`บันทึกแล้ว และส่งข้อความทดสอบ ${result?.sent ?? 0} รายการ`);
        }
      } else {
        setSuccess("บันทึกการตั้งค่า LINE แล้ว");
      }
    } catch {
      setError("ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await save(false);
  }

  const diag = config?.diagnostics;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {diag && (
        <div
          className={`rounded-xl border px-3.5 py-3 text-sm ${
            diag.ready
              ? "border-[var(--bd-done)] bg-[var(--bd-done-bg)]"
              : "border-[#e0c3c3] bg-[#faf1f1]"
          }`}
        >
          <p className="font-semibold">
            {diag.ready
              ? "สถานะ: พร้อมส่งแจ้งเตือน LINE"
              : "สถานะ: ยังเชื่อมต่อไม่ครบ"}
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            <StatusRow
              ok={diag.enabled}
              label="เปิดสวิตช์แจ้งเตือน LINE แล้ว"
            />
            <StatusRow ok={diag.tokenOk} label={diag.tokenDetail} />
            <StatusRow
              ok={diag.hasSecret}
              label={
                diag.hasSecret
                  ? "ใส่ Channel secret แล้ว"
                  : "ยังไม่ใส่ Channel secret (ใส่เพื่อให้ webhook ปลอดภัย)"
              }
            />
            <StatusRow
              ok={diag.targetCount > 0}
              label={
                diag.targetCount > 0
                  ? `มีผู้รับ ${diag.targetCount} รายการ`
                  : 'ยังไม่มีผู้รับ — เชิญบอทเข้ากลุ่มแล้วพิมพ์ "ลงทะเบียน"'
              }
            />
          </ul>
          <p className="mt-2 break-words text-xs text-[var(--bd-muted)]">
            {diag.lastWebhook
              ? `webhook ล่าสุด: ${diag.lastWebhook}`
              : "ยังไม่เคยได้รับ webhook จาก LINE — กด Verify ใน LINE Developers เพื่อทดสอบ"}
          </p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-2 text-xs font-medium underline"
          >
            รีเฟรชสถานะ
          </button>
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        เปิดการแจ้งเตือนผ่าน LINE
      </label>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Channel access token
        </label>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={
            config?.hasToken
              ? `ใช้อยู่แล้ว (${config.tokenMasked}) — เว้นว่างหากไม่เปลี่ยน`
              : "วาง token จาก LINE Developers"
          }
          className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--bd-accent)]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          Channel secret
        </label>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder={
            config?.hasSecret
              ? `ใช้อยู่แล้ว (${config.secretMasked}) — เว้นว่างหากไม่เปลี่ยน`
              : "วาง secret สำหรับตรวจ webhook"
          }
          className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--bd-accent)]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">
          กลุ่ม / ผู้รับที่ผูกแล้ว
        </label>
        <textarea
          rows={3}
          value={targets}
          onChange={(e) => setTargets(e.target.value)}
          placeholder="ยังไม่มี — เชิญบอทเข้ากลุ่มแล้วพิมพ์ ลงทะเบียน"
          className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 font-mono text-xs outline-none focus:border-[var(--bd-accent)]"
        />
        <p className="mt-1.5 text-xs text-[var(--bd-muted)]">
          ปกติระบบจะเติมให้อัตโนมัติเมื่อพิมพ์คำว่า{" "}
          <span className="font-medium">ลงทะเบียน</span> ในกลุ่ม LINE
        </p>
      </div>

      <div className="rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-3 text-sm">
        <p className="font-medium">Webhook URL</p>
        <p className="mt-1 break-all font-mono text-xs text-[var(--bd-muted)]">
          {webhookUrl}
        </p>
        <p className="mt-2 text-xs text-[var(--bd-muted)]">
          นำไปใส่ใน LINE Developers → Messaging API → Webhook URL แล้วเปิด Use webhook
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-[#f8e8e8] px-3 py-2 text-sm text-[#8a3b3b]">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-lg bg-[var(--bd-done-bg)] px-3 py-2 text-sm text-[var(--bd-done)]">
          {success}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--bd-accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--bd-accent-hover)] disabled:opacity-60"
        >
          {loading ? "กำลังบันทึก..." : "บันทึก"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => void save(true)}
          className="rounded-xl bg-[var(--bd-secondary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--bd-secondary-hover)] disabled:opacity-60"
        >
          บันทึกและทดสอบส่ง LINE
        </button>
      </div>
    </form>
  );
}
