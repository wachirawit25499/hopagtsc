import { createHmac, timingSafeEqual } from "crypto";
import { APP_NAME, STATUS_LABELS, formatDisplayName } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { TicketStatus } from "@prisma/client";

/** เปิดการแจ้งเตือน LINE Messaging API */
export const LINE_NOTIFICATIONS_ENABLED = true;

const KEYS = {
  token: "line.channelAccessToken",
  secret: "line.channelSecret",
  targets: "line.targetIds",
  enabled: "line.enabled",
} as const;

const WEBHOOK_LOG_KEY = "line.lastWebhook";

export type LineSettings = {
  token: string;
  secret: string;
  targets: string[];
  enabled: boolean;
};

function parseTargets(raw: string) {
  return raw
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function getLineSettings(): Promise<LineSettings> {
  const rows = await prisma.appSetting.findMany({
    where: { key: { in: Object.values(KEYS) } },
  });
  const map = Object.fromEntries(rows.map((row) => [row.key, row.value]));

  const token =
    map[KEYS.token]?.trim() || process.env.LINE_CHANNEL_ACCESS_TOKEN?.trim() || "";
  const secret =
    map[KEYS.secret]?.trim() || process.env.LINE_CHANNEL_SECRET?.trim() || "";
  const targetsRaw =
    map[KEYS.targets]?.trim() || process.env.LINE_TARGET_IDS?.trim() || "";
  const enabled =
    LINE_NOTIFICATIONS_ENABLED && (map[KEYS.enabled] ?? "true") !== "false";

  return {
    token,
    secret,
    targets: parseTargets(targetsRaw),
    enabled,
  };
}

export async function saveLineSettings(input: {
  token?: string;
  secret?: string;
  targets?: string;
  enabled?: boolean;
  keepToken?: boolean;
  keepSecret?: boolean;
}) {
  const current = await getLineSettings();
  const token = input.keepToken ? current.token : (input.token ?? "").trim();
  const secret = input.keepSecret ? current.secret : (input.secret ?? "").trim();
  const targets = (input.targets ?? current.targets.join("\n")).trim();
  const enabled = input.enabled ?? current.enabled;

  await prisma.$transaction([
    prisma.appSetting.upsert({
      where: { key: KEYS.token },
      create: { key: KEYS.token, value: token },
      update: { value: token },
    }),
    prisma.appSetting.upsert({
      where: { key: KEYS.secret },
      create: { key: KEYS.secret, value: secret },
      update: { value: secret },
    }),
    prisma.appSetting.upsert({
      where: { key: KEYS.targets },
      create: { key: KEYS.targets, value: targets },
      update: { value: targets },
    }),
    prisma.appSetting.upsert({
      where: { key: KEYS.enabled },
      create: { key: KEYS.enabled, value: enabled ? "true" : "false" },
      update: { value: enabled ? "true" : "false" },
    }),
  ]);
}

export async function addLineTarget(id: string) {
  const settings = await getLineSettings();
  if (!id || settings.targets.includes(id)) {
    return settings.targets;
  }
  const next = [...settings.targets, id];
  await prisma.appSetting.upsert({
    where: { key: KEYS.targets },
    create: { key: KEYS.targets, value: next.join("\n") },
    update: { value: next.join("\n") },
  });
  return next;
}

export async function recordWebhookEvent(summary: string) {
  const value = `${new Date().toISOString()} · ${summary}`;
  try {
    await prisma.appSetting.upsert({
      where: { key: WEBHOOK_LOG_KEY },
      create: { key: WEBHOOK_LOG_KEY, value },
      update: { value },
    });
  } catch {
    // Diagnostics must never break the webhook response.
  }
}

async function getLastWebhook() {
  const row = await prisma.appSetting.findUnique({
    where: { key: WEBHOOK_LOG_KEY },
  });
  return row?.value ?? "";
}

async function checkToken(token: string) {
  if (!token) {
    return { ok: false, detail: "ยังไม่ได้ใส่ Channel access token" };
  }
  try {
    const res = await fetch("https://api.line.me/v2/bot/info", {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = (await res.json()) as { displayName?: string };
      return {
        ok: true,
        detail: data.displayName
          ? `เชื่อมต่อบัญชี "${data.displayName}" สำเร็จ`
          : "Token ใช้งานได้",
      };
    }
    if (res.status === 401) {
      return { ok: false, detail: "Token ไม่ถูกต้องหรือหมดอายุ (401)" };
    }
    return { ok: false, detail: `LINE ตอบกลับสถานะ ${res.status}` };
  } catch {
    return { ok: false, detail: "ติดต่อ LINE API ไม่ได้" };
  }
}

export async function getLineDiagnostics() {
  const settings = await getLineSettings();
  const [tokenCheck, lastWebhook] = await Promise.all([
    checkToken(settings.token),
    getLastWebhook(),
  ]);

  return {
    enabled: settings.enabled,
    hasToken: Boolean(settings.token),
    hasSecret: Boolean(settings.secret),
    targetCount: settings.targets.length,
    tokenOk: tokenCheck.ok,
    tokenDetail: tokenCheck.detail,
    lastWebhook,
    ready:
      settings.enabled &&
      tokenCheck.ok &&
      settings.targets.length > 0,
  };
}

export function getPublicAppUrl() {
  const explicit = process.env.APP_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }
  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railway) {
    return `https://${railway.replace(/^https?:\/\//, "")}`;
  }
  return "https://hopagtsc-production.up.railway.app";
}

export function verifyLineSignatureWithSecret(
  body: string,
  signature: string | null,
  secret: string,
) {
  if (!secret || !signature) {
    return false;
  }
  const digest = createHmac("sha256", secret).update(body).digest("base64");
  const a = Buffer.from(digest);
  const b = Buffer.from(signature);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}

async function pushLineMessage(token: string, to: string, text: string) {
  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to,
      messages: [{ type: "text", text: text.slice(0, 4900) }],
    }),
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`LINE push failed (${res.status}): ${detail}`);
  }
}

export async function sendLineText(text: string) {
  if (!LINE_NOTIFICATIONS_ENABLED) {
    return { sent: 0, skipped: true };
  }
  const settings = await getLineSettings();
  if (!settings.enabled || !settings.token || settings.targets.length === 0) {
    return { sent: 0, skipped: true };
  }

  let sent = 0;
  const errors: string[] = [];
  for (const to of settings.targets) {
    try {
      await pushLineMessage(settings.token, to, text);
      sent += 1;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : "ส่ง LINE ไม่สำเร็จ");
    }
  }

  return { sent, skipped: false, errors };
}

export async function notifyNewRepair(input: {
  id: string;
  title: string;
  description: string;
  location: string;
  reporterName: string;
  dormitory?: string | null;
  roomNumber?: string | null;
}) {
  const url = `${getPublicAppUrl()}/requests/${input.id}`;
  const place = [input.dormitory, input.roomNumber].filter(Boolean).join(" ");
  const text = [
    `🔔 มีใบแจ้งซ่อมใหม่ — ${APP_NAME}`,
    `หัวข้อ: ${input.title}`,
    `อาการ: ${input.description}`,
    `สถานที่: ${input.location}`,
    `ผู้แจ้ง: ${input.reporterName}`,
    place ? `หอ/ห้อง: ${place}` : null,
    `ดูรายละเอียด: ${url}`,
  ]
    .filter(Boolean)
    .join("\n");

  return sendLineText(text);
}

export async function notifyStatusChange(input: {
  id: string;
  title: string;
  fromStatus: TicketStatus;
  toStatus: TicketStatus;
}) {
  const url = `${getPublicAppUrl()}/requests/${input.id}`;
  const text = [
    `🛠️ อัปเดตสถานะงานซ่อม — ${APP_NAME}`,
    `หัวข้อ: ${input.title}`,
    `สถานะ: ${STATUS_LABELS[input.fromStatus]} → ${STATUS_LABELS[input.toStatus]}`,
    `ดูรายละเอียด: ${url}`,
  ].join("\n");

  return sendLineText(text);
}

export function reporterDisplayName(user: {
  namePrefix?: string | null;
  firstName: string;
  lastName: string;
}) {
  return formatDisplayName(user.namePrefix, user.firstName, user.lastName);
}
