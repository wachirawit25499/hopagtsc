"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { PasswordField } from "@/components/PasswordField";
import { APP_NAME, DEVELOPER_CREDIT } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const [tenantCode, setTenantCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantCode, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }

      const role = data.user?.role as string | undefined;
      router.push(role === "TENANT" ? "/dashboard" : "/requests");
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
        <div className="animate-fade-up mb-8 flex flex-col items-center text-center">
          <BrandLogo size={64} />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--bd-ink)]">
            {APP_NAME}
          </h1>
          <p className="mt-2 text-sm text-[var(--bd-muted)]">
            ระบบแจ้งซ่อมและติดตามงานซ่อมหอพัก
          </p>
        </div>

        <form onSubmit={onSubmit} className="animate-fade-up delay-1 space-y-4">
          <div>
            <label
              htmlFor="tenantCode"
              className="mb-1.5 block text-sm font-medium text-[var(--bd-ink)]"
            >
              รหัสประจำตัวนักเรียนนักศึกษา
            </label>
            <input
              id="tenantCode"
              inputMode="numeric"
              pattern="\d{10}"
              maxLength={10}
              required
              value={tenantCode}
              onChange={(e) =>
                setTenantCode(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="กรอกตัวเลข 10 หลัก"
              className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 text-[var(--bd-ink)] outline-none transition focus:border-[var(--bd-accent)]"
            />
          </div>

          <PasswordField
            id="password"
            label="รหัสผ่าน"
            value={password}
            onChange={setPassword}
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
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div className="animate-fade-up delay-2 mt-5">
          <Link
            href="/register"
            className="block w-full rounded-xl bg-[var(--bd-secondary)] py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[var(--bd-secondary-hover)]"
          >
            ลงทะเบียน
          </Link>
        </div>
      </div>

      <p className="animate-fade-up delay-3 mt-8 text-center text-sm text-[var(--bd-muted)]">
        {DEVELOPER_CREDIT}
      </p>
    </main>
  );
}
