import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { statusSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  }

  if (user.role !== "TECHNICIAN" && user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "ไม่มีสิทธิ์เปลี่ยนสถานะงาน" },
      { status: 403 },
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = statusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "สถานะไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const existing = await prisma.repairTicket.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "ไม่พบใบแจ้งซ่อม" }, { status: 404 });
    }

    if (existing.status === parsed.data.status) {
      return NextResponse.json({ ticket: existing });
    }

    const ticket = await prisma.$transaction(async (tx) => {
      const updated = await tx.repairTicket.update({
        where: { id },
        data: { status: parsed.data.status },
      });

      await tx.statusChangeLog.create({
        data: {
          ticketId: id,
          fromStatus: existing.status,
          toStatus: parsed.data.status,
          changedById: user.id,
        },
      });

      return updated;
    });

    return NextResponse.json({ ticket });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}
