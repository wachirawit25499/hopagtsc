"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { Role } from "@prisma/client";
import { DORMITORIES, NAME_PREFIXES, ROLE_LABELS } from "@/lib/constants";

type UserEditData = {
  id: string;
  tenantCode: string;
  namePrefix: string | null;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  dormitory: string | null;
  roomNumber: string | null;
  role: Role;
};

export function AdminUserEditForm({ user }: { user: UserEditData }) {
  const router = useRouter();
  const [form, setForm] = useState({
    tenantCode: user.tenantCode,
    namePrefix: user.namePrefix ?? "",
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber ?? "",
    dormitory: user.dormitory ?? "",
    roomNumber: user.roomNumber ?? "",
    role: user.role,
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      setSuccess("บันทึกข้อมูลผู้ใช้แล้ว");
      setForm((prev) => ({ ...prev, password: "" }));
      router.refresh();
    } catch {
      setError("ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setLoading(false);
    }
  }

  return (
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
        <label className="mb-1.5 block text-sm font-medium">คำนำหน้าชื่อ</label>
        <select
          value={form.namePrefix}
          onChange={(e) => update("namePrefix", e.target.value)}
          className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--bd-accent)]"
        >
          <option value="">ไม่ระบุ</option>
          {NAME_PREFIXES.map((prefix) => (
            <option key={prefix} value={prefix}>
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
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium">หอพัก</label>
        <select
          value={form.dormitory}
          onChange={(e) => update("dormitory", e.target.value)}
          className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--bd-accent)]"
        >
          <option value="">ไม่ระบุ</option>
          {DORMITORIES.map((dorm) => (
            <option key={dorm} value={dorm}>
              {dorm}
            </option>
          ))}
        </select>
      </div>
      <Field
        label="หมายเลขห้อง"
        value={form.roomNumber}
        onChange={(v) => update("roomNumber", v)}
      />
      <div>
        <label className="mb-1.5 block text-sm font-medium">บทบาท</label>
        <select
          value={form.role}
          onChange={(e) => update("role", e.target.value as Role)}
          className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--bd-accent)]"
        >
          {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </div>
      <Field
        label="รหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)"
        type="password"
        value={form.password}
        onChange={(v) => update("password", v.replace(/\D/g, "").slice(0, 6))}
        inputMode="numeric"
        maxLength={6}
      />

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

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[var(--bd-accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--bd-accent-hover)] disabled:opacity-60"
        >
          {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        </button>
        <Link
          href="/admin/database"
          className="rounded-xl bg-[var(--bd-secondary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--bd-secondary-hover)]"
        >
          กลับ
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  ...rest
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: "numeric";
  maxLength?: number;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--bd-accent)]"
        {...rest}
      />
    </div>
  );
}
