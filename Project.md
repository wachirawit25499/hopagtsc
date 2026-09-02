# แจ้งซ่อมหอพัก TSC — Property Repair Operations Platform

ระบบแจ้งซ่อมและติดตามงานซ่อมสำหรับหอพัก TSC  
ระดับ: **Business / Production-ready MVP**

---

## 1. ภาพรวมธุรกิจ (Business Overview)

| รายการ | รายละเอียด |
|--------|------------|
| **ชื่อผลิตภัณฑ์** | แจ้งซ่อมหอพัก TSC |
| **ปัญหาที่แก้** | นักเรียนนักศึกษาแจ้งซ่อมผ่านแชท/โทรศัพท์ ทำให้ข้อมูลหาย ติดตามยาก ช่างไม่รู้คิวงาน Admin ไม่มีภาพรวม |
| **คุณค่าหลัก** | ศูนย์กลางใบแจ้งซ่อมแบบมีสถานะ แยกสิทธิ์ตามบทบาท และตรวจสอบย้อนหลังได้ |
| **กลุ่มผู้ใช้** | นักเรียนนักศึกษา (Tenant) · ช่างซ่อม (Technician) · ผู้ดูแลระบบ (Admin) |
| **ขอบเขต MVP** | Auth · แจ้งซ่อม · Dashboard ตาม Role · อัปเดตสถานะงาน |

### ตัวชี้วัดความสำเร็จ (MVP Success Criteria)
- นักเรียนนักศึกษาสร้างใบแจ้งซ่อมได้ภายใน 1 นาทีหลังล็อกอิน
- ช่าง/Admin เปลี่ยนสถานะงานได้แบบเรียลไทม์ (refresh)
- ข้อมูลแยกตาม Role ชัดเจน (นักเรียนนักศึกษาเห็นเฉพาะของตัวเอง)
- รหัสประจำตัวนักเรียนนักศึกษา 10 หลักเป็นตัวระบุหลักในการเข้าสู่ระบบ

---

## 2. บทบาทและสิทธิ์ (Roles & Permissions)

| Role | สิทธิ์ |
|------|--------|
| **TENANT** (นักเรียนนักศึกษา) | ลงทะเบียน / เข้าสู่ระบบ · สร้างใบแจ้งซ่อม · ดูประวัติใบของตนเอง |
| **TECHNICIAN** | เข้าสู่ระบบ · ดูใบงานทั้งหมด · เปลี่ยนสถานะงาน |
| **ADMIN** | สิทธิ์ช่างทั้งหมด · ภาพรวมระบบ · (MVP: จัดการสถานะเหมือนช่าง) |

---

## 3. สถาปัตยกรรม (3-Tier Architecture)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Presentation   │────▶│   Application   │────▶│      Data       │
│  Next.js + UI   │◀────│  API Routes     │◀────│  SQLite/Prisma  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Tech Stack (Business Standard)

| ชั้น | เทคโนโลยี | เหตุผล |
|------|-----------|--------|
| Front-end | Next.js 15 (App Router), TypeScript, Tailwind CSS | SSR/CSR ผสม, DX ดี, deploy ง่าย |
| UI | Kanit (Google Fonts), design tokens | รองรับภาษาไทย, ภาพลักษณ์องค์กร |
| Auth | Session cookie (iron-session / JWT httpOnly) | ปลอดภัยกว่า localStorage |
| Back-end | Next.js Route Handlers | Monorepo เดียว, API ชัดเจน |
| ORM | Prisma | Schema เป็นเอกสาร, migrate ได้ |
| DB | SQLite (dev) → PostgreSQL (prod-ready path) | เริ่มเร็ว, scale ได้ภายหลัง |
| Validation | Zod | ตรวจ input ที่ขอบเขต API |

---

## 4. Presentation Tier — หน้าจอและ UX

### 4.1 Brand & Visual Direction
- **Brand:** แจ้งซ่อมหอพัก TSC — สัญลักษณ์ตึก + เครื่องมือช่าง
- **ฟอนต์:** Kanit ทั้งระบบ (บังคับ)
- **โทนสี:** เทาเย็นองค์กร + พื้นขาวอุ่น + ปุ่มเข้ม (slate/charcoal) — ไม่ใช้ม่วง / cream-terracotta / dark neon
- **บรรยากาศ:** พื้นหลังเทาอ่อน มี texture เบาๆ ไม่แบนราบ
- **Developer credit:** แสดงชื่อผู้พัฒนาท้ายหน้า Login

### 4.2 หน้า Login (`/login`)
- กล่องสี่เหลี่ยมโค้งมน สีขาวนวล กึ่งกลางจอ
- โลโก้ตึก+เครื่องมือด้านบน
- ช่อง **รหัสประจำตัวนักเรียนนักศึกษา** — ตัวเลข 10 หลักเท่านั้น (client + server validate)
- ช่อง **รหัสผ่าน** — ตัวเลขไม่เกิน 6 หลักเท่านั้น
- ปุ่ม **เข้าสู่ระบบ** (สีเข้ม)
- ปุ่ม/ลิงก์ **ลงทะเบียน** (สีเทา) ด้านล่าง

### 4.3 หน้าลงทะเบียน (`/register`)
- รหัส 10 หลัก, รหัสผ่าน (ตัวเลขไม่เกิน 6 หลัก), ยืนยันรหัสผ่าน
- คำนำหน้าชื่อ (นาย / นาง / นางสาว), ชื่อ, นามสกุล, เบอร์โทร, หอพัก (หอหญิง1–3 / หอชาย1–2), หมายเลขห้อง
- Role เริ่มต้น = TENANT (นักเรียนนักศึกษา)

### 4.4 หน้าแจ้งซ่อม (`/repairs/new`)
- หัวข้อเรื่อง
- อาการชำรุด (รายละเอียด)
- ตำแหน่ง/สถานที่ (เช่น ห้อง 502 / ชั้น 3 ห้องน้ำรวม)
- แนบรูปอาการชำรุด (JPG/PNG/WEBP/GIF ≤ 5 MB)
- ปุ่มเดียว: **แจ้งซ่อมใหม่**
- ส่งเข้าศูนย์กลาง → สถานะเริ่มต้น `PENDING`

### 4.5 หน้าตาม Role
| Role | หน้า | เนื้อหา |
|------|------|---------|
| นักเรียนนักศึกษา (Tenant) | `/dashboard` ประวัติการแจ้งซ่อม | รายการใบของตน + ลิงก์ดูรายละเอียด |
| นักเรียนนักศึกษา (Tenant) | `/dashboard/[id]` | รายละเอียดเต็ม + ความคืบหน้าสถานะ |
| นักเรียนนักศึกษา (Tenant) | `/repairs/new` | ฟอร์มแจ้งซ่อมใหม่ |
| Technician / Admin | `/requests` คำขอแจ้งซ่อม | ใบงานค้าง + badge จำนวน + ป๊อปอัปเมื่อมีใบใหม่ |
| Technician / Admin | `/requests/[id]` | รายละเอียดเต็มของคำขอ (อาการ, รูป, ผู้แจ้ง, ห้อง) |
| Technician / Admin | `/history` ประวัติการแจ้งซ่อม | ใบงาน `COMPLETED` (ดูย้อนหลัง) |
| Admin | `/admin/database` | ดู/แก้ไขตาราง User และ RepairTicket |

### สถานะงาน (Workflow)
`PENDING` (รอดำเนินการ) → `IN_PROGRESS` (กำลังซ่อม) → `COMPLETED` (เสร็จสิ้น)

---

## 5. Application Tier — API

### 5.1 Authentication API
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| POST | `/api/auth/register` | สมัครนักเรียนนักศึกษา |
| POST | `/api/auth/login` | เข้าสู่ระบบด้วยรหัส 10 หลัก + รหัสผ่าน |
| POST | `/api/auth/logout` | ออกจากระบบ |
| GET | `/api/auth/me` | ข้อมูล session ปัจจุบัน |

**กฎธุรกิจ**
- รหัสประจำตัว = ตัวเลข 10 หลักเท่านั้น
- รหัสผ่าน = ตัวเลขไม่เกิน 6 หลักเท่านั้น
- เบอร์โทร = ตัวเลข 9–10 หลัก เริ่มด้วย 0
- อีเมลภายในระบบ = `{tenantId}@buildingdesk.local` (derive จากรหัส 10 หลัก)
- รหัสผ่านเก็บแบบ hash (bcrypt)
- Session ผ่าน httpOnly cookie

### 5.2 Repair API
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| POST | `/api/repairs` | สร้างใบแจ้งซ่อม (TENANT / นักเรียนนักศึกษา) |
| GET | `/api/repairs` | ดึงรายการ (นักเรียนนักศึกษา = ของตน, Tech/Admin = ทั้งหมด) |
| GET | `/api/repairs/[id]` | รายละเอียดใบงาน |

### 5.3 Status Update API
| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| PATCH | `/api/repairs/[id]/status` | เปลี่ยนสถานะ (TECHNICIAN, ADMIN เท่านั้น) |

**Body:** `{ "status": "PENDING" | "IN_PROGRESS" | "COMPLETED" }`

---

## 6. Data Tier — ระบบฐานข้อมูล

**เทคโนโลยี:** Prisma ORM + SQLite (`prisma/dev.db`)  
**คำสั่ง:** `npm run db:migrate` · `npm run db:seed` · `npm run db:reset`

### 6.0 ER Diagram

```
┌──────────────────┐       1:N        ┌──────────────────┐
│      User        │─────────────────▶│  RepairTicket    │
│──────────────────│                  │──────────────────│
│ id (PK)          │                  │ id (PK)          │
│ tenantCode (UQ)  │                  │ title            │
│ email (UQ)       │                  │ description      │
│ passwordHash     │                  │ location         │
│ firstName        │                  │ imagePath        │
│ lastName         │                  │                  │
│ phoneNumber      │                  │ status           │
│ roomNumber       │                  │ reporterId (FK)  │
│ role             │                  │ createdAt        │
└────────┬─────────┘                  └────────┬─────────┘
         │ 1:N                                 │ 1:N
         │                                     │
         │            ┌────────────────────────┘
         │            │
         ▼            ▼
┌──────────────────────────┐
│     StatusChangeLog      │
│──────────────────────────│
│ id (PK)                  │
│ ticketId (FK)            │
│ fromStatus / toStatus    │
│ changedById (FK → User)  │
│ note                     │
│ createdAt                │
└──────────────────────────┘
```

### 6.1 User
| Field | Type | หมายเหตุ |
|-------|------|----------|
| id | CUID | Primary key |
| tenantCode | String unique | รหัสประจำตัว 10 หลัก |
| email | String unique | derive จาก tenantCode |
| passwordHash | String | bcrypt |
| namePrefix | String? | นาย / นาง / นางสาว |
| firstName | String | ชื่อ |
| lastName | String | นามสกุล |
| phoneNumber | String? | เบอร์โทร |
| dormitory | String? | หอหญิง1–3 / หอชาย1–2 |
| roomNumber | String? | หมายเลขห้อง (นักเรียนนักศึกษา) |
| role | Enum | TENANT \| TECHNICIAN \| ADMIN |
| createdAt / updatedAt | DateTime | |

### 6.2 RepairTicket
| Field | Type | หมายเหตุ |
|-------|------|----------|
| id | CUID | Primary key |
| title / description / location | String | ข้อมูลใบแจ้งซ่อม |
| imagePath | String? | path รูป (`/uploads/...`) |
| status | Enum | PENDING \| IN_PROGRESS \| COMPLETED |
| reporterId | FK → User | ผู้แจ้ง (onDelete Cascade) |
| createdAt / updatedAt | DateTime | |
| Indexes | — | status, reporterId, createdAt, (status+createdAt) |

### 6.3 StatusChangeLog (Audit)
| Field | Type | หมายเหตุ |
|-------|------|----------|
| id | CUID | Primary key |
| ticketId | FK → RepairTicket | ใบงานที่เกี่ยวข้อง |
| fromStatus | Enum? | สถานะเดิม (null = สร้างใหม่) |
| toStatus | Enum | สถานะใหม่ |
| changedById | FK → User | ผู้เปลี่ยนสถานะ |
| note | String? | หมายเหตุ |
| createdAt | DateTime | เวลาที่บันทึก |

---

## 7. แผนการพัฒนา (Implementation Plan)

| Phase | งาน | สถานะ |
|-------|-----|--------|
| **P0** | ยกระดับสเปก (ไฟล์นี้) | ✅ |
| **P1** | Scaffold โปรเจค + Prisma schema + seed (Admin/ช่าง/นักเรียนนักศึกษาตัวอย่าง) | ✅ |
| **P2** | Auth (register/login/logout/session) | ✅ |
| **P3** | UI Login / Register ตามแบรนด์ | ✅ |
| **P4** | Repair form + Repair API | ✅ |
| **P5** | Dashboard ตาม Role + Status Update | ✅ |
| **P6** | Polish: validation, empty states, responsive, seed docs | ✅ |
| **P7** | ระบบฐานข้อมูล: indexes + StatusChangeLog + ERD | ✅ |

### บัญชีทดสอบ (หลัง seed)
| Role | รหัส 10 หลัก | รหัสผ่าน |
|------|--------------|----------|
| Admin | 1000000001 | 123456 |
| Technician | 2000000001 | 123456 |
| นักเรียนนักศึกษา | 3000000001 | 123456 |

---

## 8. นอกขอบเขต MVP (Future)
- มอบหมายงานให้ช่างเฉพาะคน
- แจ้งเตือนอีเมล/LINE
- รายงานสถิติและ SLA
- ย้าย DB ไป PostgreSQL บน cloud

---

## 9. ข้อกำหนดคุณภาพ
- TypeScript ครบทุกชั้น
- Validate ด้วย Zod ทั้ง client และ API
- ไม่เก็บรหัสผ่านแบบ plain text
- ป้องกันการเข้าถึง API นอกสิทธิ์ (403)
- UI อ่านง่ายบนมือถือและเดสก์ทอป
- ฟอนต์ Kanit ทั้งแอป
