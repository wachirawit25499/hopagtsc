import Link from "next/link";
import type { TicketStatus } from "@prisma/client";
import { StatusBadge } from "@/components/StatusBadge";
import { StatusSelect } from "@/components/StatusSelect";
import { formatDisplayName } from "@/lib/constants";

export type TicketListItem = {
  id: string;
  title: string;
  description: string;
  location: string;
  imagePath: string | null;
  status: TicketStatus;
  createdAt: Date;
  reporter: {
    namePrefix?: string | null;
    firstName: string;
    lastName: string;
    dormitory?: string | null;
    roomNumber: string | null;
  };
};

export function TicketList({
  tickets,
  canManage,
  emptyText,
  detailBasePath,
}: {
  tickets: TicketListItem[];
  canManage: boolean;
  emptyText: string;
  detailBasePath?: string;
}) {
  if (tickets.length === 0) {
    return (
      <div className="animate-soft-in rounded-2xl border border-dashed border-[var(--bd-line)] bg-[var(--bd-surface)]/70 px-6 py-16 text-center">
        <p className="text-[var(--bd-muted)]">{emptyText}</p>
      </div>
    );
  }

  return (
    <ul className="animate-soft-in space-y-3">
      {tickets.map((ticket) => {
        const detailHref = detailBasePath
          ? `${detailBasePath}/${ticket.id}`
          : null;
        const summary =
          ticket.description.length > 120
            ? `${ticket.description.slice(0, 120)}…`
            : ticket.description;

        return (
          <li
            key={ticket.id}
            className="rounded-2xl bg-[var(--bd-surface)] px-5 py-4 shadow-[0_8px_24px_rgba(28,36,48,0.06)] transition hover:shadow-[0_10px_28px_rgba(28,36,48,0.1)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {detailHref ? (
                    <Link
                      href={detailHref}
                      className="text-lg font-semibold text-[var(--bd-ink)] hover:underline"
                    >
                      {ticket.title}
                    </Link>
                  ) : (
                    <h2 className="text-lg font-semibold text-[var(--bd-ink)]">
                      {ticket.title}
                    </h2>
                  )}
                  <StatusBadge status={ticket.status} />
                </div>
                <p className="mt-2 text-sm text-[var(--bd-muted)]">{summary}</p>
                {!detailHref && ticket.imagePath && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ticket.imagePath}
                    alt={`รูปประกอบ: ${ticket.title}`}
                    className="mt-3 max-h-48 rounded-xl object-cover"
                  />
                )}
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--bd-muted)]">
                  <span>สถานที่: {ticket.location}</span>
                  {canManage && (
                    <>
                      <span>
                        ผู้แจ้ง:{" "}
                        {formatDisplayName(
                          ticket.reporter.namePrefix,
                          ticket.reporter.firstName,
                          ticket.reporter.lastName,
                        )}
                      </span>
                      <span>หอ: {ticket.reporter.dormitory ?? "-"}</span>
                      <span>ห้อง: {ticket.reporter.roomNumber ?? "-"}</span>
                    </>
                  )}
                  <span>
                    วันที่: {new Date(ticket.createdAt).toLocaleString("th-TH")}
                  </span>
                  {detailHref && (
                    <Link
                      href={detailHref}
                      className="font-medium text-[var(--bd-accent)] underline"
                    >
                      ดูรายละเอียดเต็ม
                    </Link>
                  )}
                </div>
              </div>
              {canManage && ticket.status !== "COMPLETED" && (
                <StatusSelect ticketId={ticket.id} current={ticket.status} />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
