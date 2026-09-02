import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

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

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      tenantCode: true,
      namePrefix: true,
      firstName: true,
      lastName: true,
      phoneNumber: true,
      dormitory: true,
      roomNumber: true,
      role: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { tickets: true } },
    },
  });

  return NextResponse.json({ users });
}
