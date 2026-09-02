"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { PasswordField } from "@/components/PasswordField";
import { APP_NAME, DORMITORIES, NAME_PREFIXES } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    tenantCode: "",
    namePrefix: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    dormitory: "",
    roomNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "ลงทะเบียนไม่สำเร็จ");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="animate-soft-in w-full max-w-md rounded-2xl bg-[var(--bd-surface)] px-8 py-10 shadow-[0_18px_50px_rgba(28,36,48,0.12)]">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandLogo size={56} />
          <h1 className="mt-4 text-2xl font-bold text-[var(--bd-ink)]">
            ลงทะเบียนนักเรียนนักศึกษา
          </h1>
          <p className="mt-2 text-sm text-[var(--bd-muted)]">{APP_NAME}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field
            label="รหัสประจำตัว (10 หลัก)"
            value={form.tenantCode}
            onChange={(v) => update("tenantCode", v.replace(/\D/g, "").slice(0, 10))}
            inputMode="numeric"
            maxLength={10}
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--bd-ink)]">
              คำนำหน้าชื่อ
            </label>
            <select
              required
              value={form.namePrefix}
              onChange={(e) => update("namePrefix", e.target.value)}
              className={`w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 outline-none transition focus:border-[var(--bd-accent)] ${
                form.namePrefix
                  ? "text-[var(--bd-ink)]"
                  : "text-[var(--bd-muted)]"
              }`}
            >
              <option value="" disabled className="text-[var(--bd-muted)]">
                กรุณาเลือก
              </option>
              {NAME_PREFIXES.map((prefix) => (
                <option
                  key={prefix}
                  value={prefix}
                  className="text-[var(--bd-ink)]"
                >
                  {prefix}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="ชื่อ"
            value={form.firstName}
            onChange={(v) => update("firstName", v)}
            required
          />
          <Field
            label="นามสกุล"
            value={form.lastName}
            onChange={(v) => update("lastName", v)}
            required
          />
          <Field
            label="เบอร์โทร"
            value={form.phoneNumber}
            onChange={(v) => update("phoneNumber", v.replace(/\D/g, "").slice(0, 10))}
            inputMode="numeric"
            maxLength={10}
            required
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--bd-ink)]">
              หอพัก
            </label>
            <select
              required
              value={form.dormitory}
              onChange={(e) => update("dormitory", e.target.value)}
              className={`w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 outline-none transition focus:border-[var(--bd-accent)] ${
                form.dormitory
                  ? "text-[var(--bd-ink)]"
                  : "text-[var(--bd-muted)]"
              }`}
            >
              <option value="" disabled className="text-[var(--bd-muted)]">
                กรุณาเลือก
              </option>
              {DORMITORIES.map((dorm) => (
                <option key={dorm} value={dorm} className="text-[var(--bd-ink)]">
                  {dorm}
                </option>
              ))}
            </select>
          </div>
          <Field
            label="หมายเลขห้อง"
            value={form.roomNumber}
            onChange={(v) => update("roomNumber", v)}
            required
          />
          <PasswordField
            id="password"
            label="รหัสผ่าน (ตัวเลขไม่เกิน 6 หลัก)"
            value={form.password}
            onChange={(v) => update("password", v)}
            required
          />
          <PasswordField
            id="confirmPassword"
            label="ยืนยันรหัสผ่าน"
            value={form.confirmPassword}
            onChange={(v) => update("confirmPassword", v)}
            required
          />

          {error && (
            <p className="rounded-lg bg-[#f8e8e8] px-3 py-2 text-sm text-[#8a3b3b]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--bd-accent)] py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--bd-accent-hover)] disabled:opacity-60"
          >
            {loading ? "กำลังบันทึก..." : "สร้างบัญชี"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--bd-muted)]">
          มีบัญชีแล้ว?{" "}
          <Link href="/login" className="font-medium text-[var(--bd-accent)] underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  inputMode?: "numeric";
  maxLength?: number;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-[var(--bd-ink)]">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 text-[var(--bd-ink)] outline-none transition focus:border-[var(--bd-accent)]"
        {...rest}
      />
    </div>
  );
}
