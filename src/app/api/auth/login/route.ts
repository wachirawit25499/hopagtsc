import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const { tenantCode, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { tenantCode } });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json(
        { error: "รหัสประจำตัวหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 },
      );
    }

    const session = await getSession();
    session.user = {
      id: user.id,
      tenantCode: user.tenantCode,
      namePrefix: user.namePrefix,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      roomNumber: user.roomNumber,
    };
    await session.save();

    return NextResponse.json({
      user: {
        id: user.id,
        tenantCode: user.tenantCode,
        namePrefix: user.namePrefix,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        roomNumber: user.roomNumber,
      },
    });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}
