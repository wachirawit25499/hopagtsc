import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { registerSchema, toInternalEmail } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const {
      tenantCode,
      password,
      namePrefix,
      firstName,
      lastName,
      phoneNumber,
      dormitory,
      roomNumber,
    } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { tenantCode } });
    if (existing) {
      return NextResponse.json(
        { error: "รหัสประจำตัวนี้ถูกใช้งานแล้ว" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        tenantCode,
        email: toInternalEmail(tenantCode),
        passwordHash,
        namePrefix,
        firstName,
        lastName,
        phoneNumber,
        dormitory,
        roomNumber,
        role: "TENANT",
      },
    });

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

    return NextResponse.json(
      {
        user: {
          id: user.id,
          tenantCode: user.tenantCode,
          namePrefix: user.namePrefix,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          roomNumber: user.roomNumber,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}
