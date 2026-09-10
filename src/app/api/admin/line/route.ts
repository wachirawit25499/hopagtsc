import { NextResponse } from "next/server";
import {
  getLineDiagnostics,
  getLineSettings,
  saveLineSettings,
  sendLineText,
} from "@/lib/line";
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

function maskSecret(value: string) {
  if (!value) return "";
  if (value.length <= 8) return "••••••••";
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  const [settings, diagnostics] = await Promise.all([
    getLineSettings(),
    getLineDiagnostics(),
  ]);

  return NextResponse.json({
    enabled: settings.enabled,
    hasToken: Boolean(settings.token),
    hasSecret: Boolean(settings.secret),
    tokenMasked: maskSecret(settings.token),
    secretMasked: maskSecret(settings.secret),
    targets: settings.targets,
    webhookUrl: "/api/line/webhook",
    diagnostics,
  });
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth && auth.error) {
    return auth.error;
  }

  try {
    const body = (await request.json()) as {
      token?: string;
      secret?: string;
      targets?: string;
      enabled?: boolean;
      test?: boolean;
    };

    await saveLineSettings({
      token: body.token,
      secret: body.secret,
      targets: body.targets,
      enabled: body.enabled,
      keepToken: !body.token?.trim(),
      keepSecret: !body.secret?.trim(),
    });

    let testResult:
      | { sent: number; skipped?: boolean; errors?: string[]; reason?: string }
      | null = null;

    if (body.test) {
      const settings = await getLineSettings();
      if (!settings.enabled) {
        testResult = {
          sent: 0,
          skipped: true,
          reason: "ยังไม่ได้เปิดสวิตช์ “เปิดการแจ้งเตือนผ่าน LINE”",
        };
      } else if (!settings.token) {
        testResult = {
          sent: 0,
          skipped: true,
          reason: "ยังไม่ได้ใส่ Channel access token",
        };
      } else if (settings.targets.length === 0) {
        testResult = {
          sent: 0,
          skipped: true,
          reason:
            "ยังไม่มีกลุ่มผู้รับ — เชิญบอทเข้ากลุ่มแล้วพิมพ์ “ลงทะเบียน” ในกลุ่ม",
        };
      } else {
        testResult = await sendLineText(
          "ทดสอบการแจ้งเตือนจากระบบแจ้งซ่อมหอพัก TSC\nถ้าเห็นข้อความนี้ แสดงว่าเชื่อมต่อ LINE สำเร็จ",
        );
      }
    }

    const [settings, diagnostics] = await Promise.all([
      getLineSettings(),
      getLineDiagnostics(),
    ]);

    return NextResponse.json({
      ok: true,
      enabled: settings.enabled,
      targets: settings.targets,
      diagnostics,
      testResult,
    });
  } catch {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในระบบ" }, { status: 500 });
  }
}
