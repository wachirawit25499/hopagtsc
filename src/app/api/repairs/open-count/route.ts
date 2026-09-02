import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  }

  if (user.role !== "TECHNICIAN" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  const count = await prisma.repairTicket.count({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS"] },
    },
  });

  return NextResponse.json({ count });
}
