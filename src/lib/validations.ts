import { z } from "zod";
import { DORMITORIES, NAME_PREFIXES } from "@/lib/constants";

export const tenantCodeSchema = z
  .string()
  .regex(/^\d{10}$/, "รหัสประจำตัวต้องเป็นตัวเลข 10 หลักเท่านั้น");

export const dormitorySchema = z.enum(DORMITORIES, {
  message: "กรุณาเลือกหอพัก",
});

export const namePrefixSchema = z.enum(NAME_PREFIXES, {
  message: "กรุณาเลือกคำนำหน้าชื่อ",
});

export const passwordSchema = z
  .string()
  .regex(/^\d{1,6}$/, "รหัสผ่านต้องเป็นตัวเลขไม่เกิน 6 หลักเท่านั้น");

export const phoneNumberSchema = z
  .string()
  .regex(/^0\d{8,9}$/, "เบอร์โทรต้องเป็นตัวเลข 9–10 หลัก เริ่มด้วย 0");

export const loginSchema = z.object({
  tenantCode: tenantCodeSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    tenantCode: tenantCodeSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    namePrefix: namePrefixSchema,
    firstName: z.string().min(1, "กรุณากรอกชื่อ"),
    lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
    phoneNumber: phoneNumberSchema,
    dormitory: dormitorySchema,
    roomNumber: z.string().min(1, "กรุณากรอกหมายเลขห้อง"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
  });

export const repairSchema = z.object({
  title: z.string().min(3, "กรุณากรอกหัวข้ออย่างน้อย 3 ตัวอักษร"),
  description: z.string().min(5, "กรุณาอธิบายอาการชำรุด"),
  location: z.string().min(2, "กรุณาระบุตำแหน่งสถานที่"),
});

export const statusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
});

export const adminUpdateUserSchema = z
  .object({
    tenantCode: tenantCodeSchema,
    namePrefix: z.string(),
    firstName: z.string().min(1, "กรุณากรอกชื่อ"),
    lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
    phoneNumber: z.string(),
    dormitory: z.string(),
    roomNumber: z.string(),
    role: z.enum(["TENANT", "TECHNICIAN", "ADMIN"]),
    password: z.string(),
  })
  .superRefine((data, ctx) => {
    const namePrefix = data.namePrefix.trim();
    if (
      namePrefix &&
      !(NAME_PREFIXES as readonly string[]).includes(namePrefix)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["namePrefix"],
        message: "กรุณาเลือกคำนำหน้าชื่อให้ถูกต้อง",
      });
    }
    const phone = data.phoneNumber.trim();
    if (phone && !/^0\d{8,9}$/.test(phone)) {
      ctx.addIssue({
        code: "custom",
        path: ["phoneNumber"],
        message: "เบอร์โทรต้องเป็นตัวเลข 9–10 หลัก เริ่มด้วย 0",
      });
    }
    const dormitory = data.dormitory.trim();
    if (
      dormitory &&
      !(DORMITORIES as readonly string[]).includes(dormitory)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["dormitory"],
        message: "กรุณาเลือกหอพักให้ถูกต้อง",
      });
    }
    const password = data.password.trim();
    if (password && !/^\d{1,6}$/.test(password)) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "รหัสผ่านต้องเป็นตัวเลขไม่เกิน 6 หลักเท่านั้น",
      });
    }
  });

export const adminUpdateRepairSchema = z.object({
  title: z.string().min(3, "กรุณากรอกหัวข้ออย่างน้อย 3 ตัวอักษร"),
  description: z.string().min(5, "กรุณาอธิบายอาการชำรุด"),
  location: z.string().min(2, "กรุณาระบุตำแหน่งสถานที่"),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
});

export function toInternalEmail(tenantCode: string) {
  return `${tenantCode}@buildingdesk.local`;
}
