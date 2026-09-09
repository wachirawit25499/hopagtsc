import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, service: "line-webhook", disabled: true });
}

export async function POST() {
  return NextResponse.json({ ok: true, disabled: true });
}
