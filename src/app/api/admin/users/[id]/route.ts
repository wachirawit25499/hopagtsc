import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { adminUpdateUserSchema, toInternalEmail } from "@/lib/validations";

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
    const parsed = adminUpdateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    const {
      tenantCode,
      namePrefix,
      firstName,
      lastName,
      phoneNumber,
      dormitory,
      roomNumber,
      role,
      password,
    } = parsed.data;

    if (
      existing.role === "ADMIN" &&
      role !== "ADMIN" &&
      auth.user!.id === id
    ) {
      return NextResponse.json(
        { error: "ไม่สามารถลดสิทธิ์บัญชีของตัวเองได้" },
        { status: 400 },
      );
    }

    const duplicateCode = await prisma.user.findFirst({
      where: { tenantCode, NOT: { id } },
    });
    if (duplicateCode) {
      return NextResponse.json(
        { error: "รหัสประจำตัวนี้ถูกใช้งานแล้ว" },
        { status: 409 },
      );
    }

    const data: {
      tenantCode: string;
      email: string;
      namePrefix: string | null;
      firstName: string;
      lastName: string;
      phoneNumber: string | null;
      dormitory: string | null;
      roomNumber: string | null;
      role: "TENANT" | "TECHNICIAN" | "ADMIN";
      passwordHash?: string;
    } = {
      tenantCode,
      email: toInternalEmail(tenantCode),
      namePrefix: namePrefix.trim() || null,
      firstName,
      lastName,
      phoneNumber: phoneNumber.trim() || null,
      dormitory: dormitory.trim() || null,
      roomNumber: roomNumber.trim() || null,
      role,
    };

    if (password.trim()) {
      data.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
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
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}
