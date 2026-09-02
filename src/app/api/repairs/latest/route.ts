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

  const ticket = await prisma.repairTicket.findFirst({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS"] },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      location: true,
      createdAt: true,
      reporter: {
        select: {
          namePrefix: true,
          firstName: true,
          lastName: true,
          dormitory: true,
          roomNumber: true,
        },
      },
    },
  });

  return NextResponse.json({ ticket });
}
