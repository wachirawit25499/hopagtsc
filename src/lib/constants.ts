import type { TicketStatus } from "@prisma/client";

export const APP_NAME = "แจ้งซ่อมหอพัก TSC";
export const DEVELOPER_CREDIT = "พัฒนาโดยทีมแจ้งซ่อมหอพัก TSC";

export const STATUS_LABELS: Record<TicketStatus, string> = {
  PENDING: "รอดำเนินการ",
  IN_PROGRESS: "กำลังซ่อม",
  COMPLETED: "เสร็จสิ้น",
};

export const ROLE_LABELS = {
  TENANT: "นักเรียนนักศึกษา",
  TECHNICIAN: "ช่างซ่อม",
  ADMIN: "ผู้ดูแลระบบ",
} as const;

export const DORMITORIES = [
  "หอหญิง1",
  "หอหญิง2",
  "หอหญิง3",
  "หอชาย1",
  "หอชาย2",
] as const;

export type Dormitory = (typeof DORMITORIES)[number];

export const NAME_PREFIXES = ["นาย", "นาง", "นางสาว"] as const;

export type NamePrefix = (typeof NAME_PREFIXES)[number];

export function formatDisplayName(
  namePrefix: string | null | undefined,
  firstName: string,
  lastName: string,
) {
  const name = `${firstName} ${lastName}`.trim();
  return namePrefix ? `${namePrefix}${name}` : name;
}
