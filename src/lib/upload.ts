import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export function getUploadDir() {
  return (
    process.env.UPLOAD_DIR?.trim() ||
    path.join(process.cwd(), "data", "uploads")
  );
}

export function isSafeUploadFilename(filename: string) {
  return /^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/i.test(filename);
}

export async function saveRepairImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("รองรับเฉพาะไฟล์รูป JPG, PNG, WEBP หรือ GIF");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("ขนาดรูปต้องไม่เกิน 5 MB");
  }

  const ext =
    file.type === "image/jpeg"
      ? "jpg"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "gif";

  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = getUploadDir();
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return `/uploads/${filename}`;
}

export async function deleteRepairImageFile(imagePath: string | null) {
  if (!imagePath) return;

  const filename = imagePath.split("/").pop();
  if (!filename || !isSafeUploadFilename(filename)) return;

  try {
    await unlink(path.join(getUploadDir(), filename));
  } catch {
    // Missing files should not block deleting the ticket.
  }
}
