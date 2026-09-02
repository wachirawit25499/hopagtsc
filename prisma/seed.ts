import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const users = [
    {
      tenantCode: "1000000001",
      email: "1000000001@buildingdesk.local",
      namePrefix: "นาย" as string | null,
      firstName: "ผู้ดูแล",
      lastName: "ระบบ",
      phoneNumber: "0810000001",
      dormitory: null as string | null,
      roomNumber: null as string | null,
      role: Role.ADMIN,
    },
    {
      tenantCode: "2000000001",
      email: "2000000001@buildingdesk.local",
      namePrefix: "นาย" as string | null,
      firstName: "ช่างซ่อม",
      lastName: "ตัวอย่าง",
      phoneNumber: "0820000001",
      dormitory: null as string | null,
      roomNumber: null as string | null,
      role: Role.TECHNICIAN,
    },
    {
      tenantCode: "3000000001",
      email: "3000000001@buildingdesk.local",
      namePrefix: "นางสาว" as string | null,
      firstName: "นักเรียนนักศึกษา",
      lastName: "ตัวอย่าง",
      phoneNumber: "0830000001",
      dormitory: "หอหญิง1" as string | null,
      roomNumber: "A-502" as string | null,
      role: Role.TENANT,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { tenantCode: user.tenantCode },
      update: {
        passwordHash,
        namePrefix: user.namePrefix,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        dormitory: user.dormitory,
        roomNumber: user.roomNumber,
        role: user.role,
      },
      create: { ...user, passwordHash },
    });
  }

  const tenant = await prisma.user.findUniqueOrThrow({
    where: { tenantCode: "3000000001" },
  });

  const existing = await prisma.repairTicket.count({
    where: { reporterId: tenant.id },
  });

  if (existing === 0) {
    const samples = [
      {
        title: "แอร์ไม่เย็น",
        description: "เครื่องปรับอากาศเปิดแล้วแต่ลมไม่ออกเย็น",
        location: "ห้อง A-502",
      },
      {
        title: "ก๊อกน้ำรั่ว",
        description: "ก๊อกอ่างล้างหน้าหยดน้ำตลอดเวลา",
        location: "ห้องน้ำห้อง A-502",
      },
    ];

    for (const sample of samples) {
      await prisma.repairTicket.create({
        data: {
          ...sample,
          reporterId: tenant.id,
          statusLogs: {
            create: {
              fromStatus: null,
              toStatus: "PENDING",
              changedById: tenant.id,
              note: "สร้างใบแจ้งซ่อม (seed)",
            },
          },
        },
      });
    }
  }

  console.log("Seed completed.");
  console.log("Admin: 1000000001 / 123456");
  console.log("Technician: 2000000001 / 123456");
  console.log("นักเรียนนักศึกษา: 3000000001 / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
