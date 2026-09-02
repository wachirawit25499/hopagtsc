"use client";

import { useRouter } from "next/navigation";
import type { TicketStatus } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/constants";
import { notifyRepairsChanged } from "@/lib/repair-events";

const options: TicketStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];

export function StatusSelect({
  ticketId,
  current,
}: {
  ticketId: string;
  current: TicketStatus;
}) {
  const router = useRouter();

  async function onChange(status: TicketStatus) {
    const res = await fetch(`/api/repairs/${ticketId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? "อัปเดตไม่สำเร็จ");
      return;
    }

    notifyRepairsChanged();
    router.refresh();
  }

  return (
    <select
      className="rounded-lg border border-[var(--bd-line)] bg-white px-2 py-1.5 text-sm text-[var(--bd-ink)] outline-none focus:border-[var(--bd-accent)]"
      value={current}
      onChange={(e) => onChange(e.target.value as TicketStatus)}
      aria-label="เปลี่ยนสถานะงาน"
    >
      {options.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
