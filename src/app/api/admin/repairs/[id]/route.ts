import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { adminUpdateRepairSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

async function requireAdmin() {
  const user = await requireUser();
  if (!user) {
    return { error: NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 }) };
  }
  if (user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้น" }, { status: 403 }) };
  }
  return { user };
}

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = adminUpdateRepairSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const existing = await prisma.repairTicket.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "ไม่พบใบแจ้งซ่อม" }, { status: 404 });
    }

    const ticket = await prisma.$transaction(async (tx) => {
      const updated = await tx.repairTicket.update({
        where: { id },
        data: parsed.data,
      });

      if (existing.status !== parsed.data.status) {
        await tx.statusChangeLog.create({
          data: {
            ticketId: id,
            fromStatus: existing.status,
            toStatus: parsed.data.status,
            changedById: auth.user!.id,
            note: "แก้ไขโดยผู้ดูแลระบบผ่านหน้าฐานข้อมูล",
          },
        });
      }

      return updated;
    });

    return NextResponse.json({ ticket });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}
