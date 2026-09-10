import { NextResponse } from "next/server";
import {
  addLineTarget,
  getLineSettings,
  recordWebhookEvent,
  verifyLineSignatureWithSecret,
} from "@/lib/line";

type LineSource = {
  type?: string;
  userId?: string;
  groupId?: string;
  roomId?: string;
};

type LineEvent = {
  type?: string;
  source?: LineSource;
  message?: { type?: string; text?: string };
};

type LineWebhookBody = {
  events?: LineEvent[];
};

function targetFromSource(source?: LineSource) {
  if (!source) return null;
  if (source.type === "group" && source.groupId) return source.groupId;
  if (source.type === "room" && source.roomId) return source.roomId;
  if (source.type === "user" && source.userId) return source.userId;
  return source.groupId || source.roomId || source.userId || null;
}

export async function GET() {
  return NextResponse.json({ ok: true, service: "line-webhook" });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-line-signature");
  const settings = await getLineSettings();

  if (settings.secret) {
    const valid = verifyLineSignatureWithSecret(
      rawBody,
      signature,
      settings.secret,
    );
    if (!valid) {
      await recordWebhookEvent(
        "LINE ติดต่อเข้ามาแล้ว แต่ Channel secret ไม่ตรง — ตรวจ secret อีกครั้ง",
      );
      return NextResponse.json({ error: "ลายเซ็นไม่ถูกต้อง" }, { status: 401 });
    }
  }

  let payload: LineWebhookBody;
  try {
    payload = JSON.parse(rawBody) as LineWebhookBody;
  } catch {
    await recordWebhookEvent("ได้รับ webhook แต่อ่านข้อมูลไม่ได้");
    return NextResponse.json({ error: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const events = payload.events ?? [];
  const registered: string[] = [];
  const seen: string[] = [];

  for (const event of events) {
    const target = targetFromSource(event.source);
    if (!target) continue;

    const text = event.message?.text?.trim() ?? "";
    seen.push(`${event.source?.type ?? "unknown"}:${event.type ?? "event"}`);

    const shouldRegister =
      event.type === "join" ||
      event.type === "follow" ||
      (event.type === "message" &&
        (text === "ลงทะเบียน" || text === "register"));

    if (shouldRegister) {
      await addLineTarget(target);
      registered.push(target);
    }
  }

  if (registered.length > 0) {
    await recordWebhookEvent(`ผูกผู้รับสำเร็จ ${registered.length} รายการ`);
  } else if (events.length === 0) {
    await recordWebhookEvent("LINE ทดสอบ Verify สำเร็จ (ไม่มี event)");
  } else {
    await recordWebhookEvent(
      `ได้รับ ${events.length} event (${seen.join(", ")}) — ยังไม่ผูก ให้พิมพ์ "ลงทะเบียน" ในกลุ่ม`,
    );
  }

  return NextResponse.json({ ok: true, registered });
}
