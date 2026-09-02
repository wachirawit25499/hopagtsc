"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatDisplayName } from "@/lib/constants";
import { notifyRepairsChanged } from "@/lib/repair-events";

type LatestTicket = {
  id: string;
  title: string;
  location: string;
  createdAt: string;
  reporter: {
    namePrefix: string | null;
    firstName: string;
    lastName: string;
    dormitory: string | null;
    roomNumber: string | null;
  };
};

const STORAGE_KEY = "staff:lastSeenRepairId";
const POLL_MS = 8000;

export function NewRepairAlert() {
  const [ticket, setTicket] = useState<LatestTicket | null>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function checkLatest() {
      try {
        const res = await fetch("/api/repairs/latest", { cache: "no-store" });
        if (!res.ok || cancelled) {
          return;
        }

        const data = (await res.json()) as { ticket: LatestTicket | null };
        const latest = data.ticket;
        if (!latest) {
          return;
        }

        const lastSeen = sessionStorage.getItem(STORAGE_KEY);

        // First poll in this page mount with no baseline: remember current
        // latest ticket without popup (avoid alerting for old jobs).
        if (!readyRef.current && !lastSeen) {
          readyRef.current = true;
          sessionStorage.setItem(STORAGE_KEY, latest.id);
          return;
        }

        readyRef.current = true;

        if (latest.id !== lastSeen) {
          setTicket(latest);
          notifyRepairsChanged();
        }
      } catch {
        // ignore polling errors
      }
    }

    void checkLatest();
    const timer = window.setInterval(() => {
      void checkLatest();
    }, POLL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  function dismiss() {
    if (ticket) {
      sessionStorage.setItem(STORAGE_KEY, ticket.id);
    }
    setTicket(null);
  }

  if (!ticket) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(28,36,48,0.45)] px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-repair-title"
    >
      <div className="animate-soft-in w-full max-w-md rounded-2xl bg-[var(--bd-surface)] p-6 shadow-[0_20px_50px_rgba(28,36,48,0.25)]">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#c45c4a]">
          แจ้งเตือนใหม่
        </p>
        <h2
          id="new-repair-title"
          className="mt-2 text-xl font-bold text-[var(--bd-ink)]"
        >
          มีคำขอแจ้งซ่อมใหม่
        </h2>
        <p className="mt-3 text-sm text-[var(--bd-muted)]">
          <span className="font-medium text-[var(--bd-ink)]">{ticket.title}</span>
          <br />
          ผู้แจ้ง:{" "}
          {formatDisplayName(
            ticket.reporter.namePrefix,
            ticket.reporter.firstName,
            ticket.reporter.lastName,
          )}
          {ticket.reporter.dormitory ? ` · ${ticket.reporter.dormitory}` : ""}
          {ticket.reporter.roomNumber
            ? ` · ห้อง ${ticket.reporter.roomNumber}`
            : ""}
          <br />
          สถานที่: {ticket.location}
          <br />
          เวลา: {new Date(ticket.createdAt).toLocaleString("th-TH")}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={`/requests/${ticket.id}`}
            onClick={dismiss}
            className="rounded-xl bg-[var(--bd-accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--bd-accent-hover)]"
          >
            ดูรายละเอียด
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-xl bg-[var(--bd-secondary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--bd-secondary-hover)]"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
