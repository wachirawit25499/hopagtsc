"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { TicketStatus } from "@prisma/client";
import { ImageViewer } from "@/components/ImageViewer";
import { STATUS_LABELS } from "@/lib/constants";
import { notifyRepairsChanged } from "@/lib/repair-events";

type RepairEditData = {
  id: string;
  title: string;
  description: string;
  location: string;
  imagePath: string | null;
  status: TicketStatus;
};

export function AdminRepairEditForm({
  ticket,
  cancelHref = "/admin/database",
  afterDeleteHref,
}: {
  ticket: RepairEditData;
  cancelHref?: string;
  afterDeleteHref?: string;
}) {
  const router = useRouter();
  const deleteHref = afterDeleteHref ?? cancelHref;
  const [form, setForm] = useState({
    title: ticket.title,
    description: ticket.description,
    location: ticket.location,
    status: ticket.status,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/repairs/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      setSuccess("บันทึกใบแจ้งซ่อมแล้ว");
      notifyRepairsChanged();
      router.refresh();
    } catch {
      setError("ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    const confirmed = window.confirm(
      `ต้องการลบใบแจ้งซ่อม "${ticket.title}" หรือไม่?\nประวัติสถานะและรูปประกอบที่เกี่ยวข้องจะถูกลบด้วย`,
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/repairs/${ticket.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ลบใบแจ้งซ่อมไม่สำเร็จ");
        return;
      }
      notifyRepairsChanged();
      router.push(deleteHref);
      router.refresh();
    } catch {
      setError("ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium">หัวข้อ</label>
        <input
          required
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--bd-accent)]"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">อาการชำรุด</label>
        <textarea
          required
          rows={4}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--bd-accent)]"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">ตำแหน่งสถานที่</label>
        <input
          required
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
          className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--bd-accent)]"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium">สถานะ</label>
        <select
          value={form.status}
          onChange={(e) => update("status", e.target.value as TicketStatus)}
          className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--bd-accent)]"
        >
          {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium">รูปประกอบ</label>
        {ticket.imagePath ? (
          <ImageViewer
            src={ticket.imagePath}
            alt={`รูปประกอบ: ${ticket.title}`}
            className="max-h-72 w-full rounded-xl border border-[var(--bd-line)] bg-white object-contain"
          />
        ) : (
          <p className="rounded-xl border border-dashed border-[var(--bd-line)] bg-white px-3.5 py-6 text-center text-sm text-[var(--bd-muted)]">
            ไม่มีรูปแนบในใบแจ้งซ่อมนี้
          </p>
        )}
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

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="submit"
          disabled={loading || deleting}
          className="rounded-xl bg-[var(--bd-accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--bd-accent-hover)] disabled:opacity-60"
        >
          {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        </button>
        <Link
          href={cancelHref}
          className="rounded-xl bg-[var(--bd-secondary)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--bd-secondary-hover)]"
        >
          กลับ
        </Link>
        <button
          type="button"
          onClick={onDelete}
          disabled={loading || deleting}
          className="ml-auto rounded-xl bg-[#c45c5c] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#a94848] disabled:opacity-60"
        >
          {deleting ? "กำลังลบ..." : "ลบประวัติ"}
        </button>
      </div>
    </form>
  );
}
