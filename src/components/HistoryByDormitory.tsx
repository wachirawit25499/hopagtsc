"use client";

import { useMemo, useState } from "react";
import { TicketList, type TicketListItem } from "@/components/TicketList";
import { DORMITORIES } from "@/lib/constants";

const UNKNOWN_DORM = "ไม่ระบุหอพัก";
const PLACEHOLDER = "";
const ALL_DORMS = "ทั้งหมด";

function dormitoryOf(ticket: TicketListItem) {
  const dorm = ticket.reporter.dormitory?.trim();
  if (!dorm) return UNKNOWN_DORM;
  if ((DORMITORIES as readonly string[]).includes(dorm)) return dorm;
  return dorm;
}

export function HistoryByDormitory({
  tickets,
  isAdmin,
}: {
  tickets: TicketListItem[];
  isAdmin: boolean;
}) {
  const dormOptions = useMemo(() => {
    const present = new Set(tickets.map(dormitoryOf));
    const ordered = [
      ...DORMITORIES.filter((dorm) => present.has(dorm)),
      ...[...present]
        .filter(
          (dorm) =>
            dorm !== UNKNOWN_DORM &&
            !(DORMITORIES as readonly string[]).includes(dorm),
        )
        .sort((a, b) => a.localeCompare(b, "th")),
      ...(present.has(UNKNOWN_DORM) ? [UNKNOWN_DORM] : []),
    ];
    return ordered;
  }, [tickets]);

  const [selected, setSelected] = useState(PLACEHOLDER);

  const filtered = useMemo(() => {
    if (!selected) return [];
    if (selected === ALL_DORMS) return tickets;
    return tickets.filter((ticket) => dormitoryOf(ticket) === selected);
  }, [tickets, selected]);

  if (tickets.length === 0) {
    return (
      <TicketList
        tickets={[]}
        canManage
        isAdmin={isAdmin}
        detailBasePath="/requests"
        emptyText="ยังไม่มีประวัติการแจ้งซ่อมที่เสร็จสิ้น"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="animate-soft-in flex flex-wrap items-end gap-3 rounded-2xl bg-[var(--bd-surface)] px-4 py-4 shadow-[0_8px_24px_rgba(28,36,48,0.06)]">
        <div className="min-w-[220px] flex-1">
          <label
            htmlFor="history-dormitory"
            className="mb-1.5 block text-sm font-medium text-[var(--bd-ink)]"
          >
            เลือกหอพัก
          </label>
          <select
            id="history-dormitory"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 text-sm text-[var(--bd-ink)] outline-none focus:border-[var(--bd-accent)]"
          >
            <option value={PLACEHOLDER}>กรุณาเลือก</option>
            <option value={ALL_DORMS}>ทั้งหมด ({tickets.length} รายการ)</option>
            {dormOptions.map((dorm) => {
              const count = tickets.filter(
                (ticket) => dormitoryOf(ticket) === dorm,
              ).length;
              return (
                <option key={dorm} value={dorm}>
                  {dorm} ({count} รายการ)
                </option>
              );
            })}
          </select>
        </div>
      </div>

      <TicketList
        tickets={filtered}
        canManage
        isAdmin={isAdmin}
        detailBasePath="/requests"
        emptyText={
          !selected
            ? "กรุณาเลือกหอพักเพื่อดูประวัติ"
            : selected === ALL_DORMS
              ? "ยังไม่มีประวัติการแจ้งซ่อมที่เสร็จสิ้น"
              : `ยังไม่มีประวัติของ${selected}`
        }
      />
    </div>
  );
}
