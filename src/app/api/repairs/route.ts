import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { saveRepairImage } from "@/lib/upload";
import { repairSchema } from "@/lib/validations";

export async function GET() {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  }

  const tickets = await prisma.repairTicket.findMany({
    where: user.role === "TENANT" ? { reporterId: user.id } : undefined,
    include: {
      reporter: {
        select: {
          firstName: true,
          lastName: true,
          tenantCode: true,
          roomNumber: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ tickets });
}

export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  }

  if (user.role !== "TENANT") {
    return NextResponse.json(
      { error: "เฉพาะนักเรียนนักศึกษาเท่านั้นที่สามารถแจ้งซ่อมได้" },
      { status: 403 },
    );
  }

  try {
    const formData = await request.formData();
    const parsed = repairSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      location: formData.get("location"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const image = formData.get("image");
    let imagePath: string | undefined;

    if (image instanceof File && image.size > 0) {
      try {
        imagePath = await saveRepairImage(image);
      } catch (err) {
        return NextResponse.json(
          {
            error:
              err instanceof Error ? err.message : "อัปโหลดรูปไม่สำเร็จ",
          },
          { status: 400 },
        );
      }
    }

    const ticket = await prisma.$transaction(async (tx) => {
      const created = await tx.repairTicket.create({
        data: {
          ...parsed.data,
          imagePath,
          reporterId: user.id,
        },
      });

      await tx.statusChangeLog.create({
        data: {
          ticketId: created.id,
          fromStatus: null,
          toStatus: "PENDING",
          changedById: user.id,
          note: "สร้างใบแจ้งซ่อม",
        },
      });

      return created;
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}
