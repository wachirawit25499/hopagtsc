"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function NewRepairForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function onImageChange(file: File | null) {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body = new FormData();
      body.append("title", title);
      body.append("description", description);
      body.append("location", location);
      if (image) {
        body.append("image", image);
      }

      const res = await fetch("/api/repairs", {
        method: "POST",
        body,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "ส่งใบแจ้งซ่อมไม่สำเร็จ");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="animate-fade-up mb-6">
        <p className="text-sm text-[var(--bd-muted)]">
          <Link href="/dashboard" className="underline">
            ประวัติการแจ้งซ่อม
          </Link>{" "}
          / แจ้งซ่อมใหม่
        </p>
        <h1 className="mt-2 text-2xl font-bold text-[var(--bd-ink)]">
          ส่งฟอร์มแจ้งซ่อม
        </h1>
        <p className="mt-1 text-sm text-[var(--bd-muted)]">
          ระบุหัวข้อ อาการชำรุด ตำแหน่งสถานที่ และแนบรูปประกอบ
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="animate-soft-in space-y-4 rounded-2xl bg-[var(--bd-surface)] p-6 shadow-[0_10px_30px_rgba(28,36,48,0.08)]"
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium">หัวข้อเรื่อง</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--bd-accent)]"
            placeholder="เช่น แอร์ไม่เย็น"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">อาการชำรุด</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--bd-accent)]"
            placeholder="อธิบายอาการที่พบ"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">ตำแหน่งสถานที่</label>
          <input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-[var(--bd-line)] bg-white px-3.5 py-2.5 outline-none focus:border-[var(--bd-accent)]"
            placeholder="เช่น ห้อง A-502 / ชั้น 3 ห้องน้ำรวม"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">
            แนบรูปอาการชำรุด
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => onImageChange(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-[var(--bd-muted)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--bd-accent)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[var(--bd-accent-hover)]"
          />
          <p className="mt-1.5 text-xs text-[var(--bd-muted)]">
            รองรับ JPG, PNG, WEBP, GIF ขนาดไม่เกิน 5 MB
          </p>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="ตัวอย่างรูปที่แนบ"
              className="mt-3 max-h-56 w-full rounded-xl object-cover"
            />
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-[#f8e8e8] px-3 py-2 text-sm text-[#8a3b3b]">
            {error}
          </p>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--bd-accent)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--bd-accent-hover)] disabled:opacity-60 sm:w-auto"
          >
            {loading ? "กำลังส่ง..." : "แจ้งซ่อมใหม่"}
          </button>
        </div>
      </form>
    </div>
  );
}
