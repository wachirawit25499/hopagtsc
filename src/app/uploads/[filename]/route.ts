import { readFile, access } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getUploadDir, isSafeUploadFilename } from "@/lib/upload";

type Params = { params: Promise<{ filename: string }> };

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(_request: Request, { params }: Params) {
  const { filename } = await params;

  if (!isSafeUploadFilename(filename)) {
    return NextResponse.json({ error: "ไม่พบรูปภาพ" }, { status: 404 });
  }

  const primaryPath = path.join(getUploadDir(), filename);
  const legacyPath = path.join(process.cwd(), "public", "uploads", filename);

  let filePath = primaryPath;
  try {
    await access(primaryPath);
  } catch {
    try {
      await access(legacyPath);
      filePath = legacyPath;
    } catch {
      return NextResponse.json({ error: "ไม่พบรูปภาพ" }, { status: 404 });
    }
  }

  try {
    const buffer = await readFile(filePath);
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "ไม่พบรูปภาพ" }, { status: 404 });
  }
}
