import type { TicketStatus } from "@prisma/client";
import { STATUS_LABELS } from "@/lib/constants";

const styles: Record<TicketStatus, string> = {
  PENDING: "bg-[var(--bd-pending-bg)] text-[var(--bd-pending)]",
  IN_PROGRESS: "bg-[var(--bd-progress-bg)] text-[var(--bd-progress)]",
  COMPLETED: "bg-[var(--bd-done-bg)] text-[var(--bd-done)]",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
