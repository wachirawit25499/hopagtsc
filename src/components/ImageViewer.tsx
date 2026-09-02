"use client";

import { useEffect, useState } from "react";

export function ImageViewer({
  src,
  alt,
  className = "max-h-72 w-full rounded-xl object-contain",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full text-left"
        aria-label={`ขยาย${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={className} />
        <p className="mt-1.5 text-xs text-[var(--bd-muted)]">คลิกเพื่อดูรูปขนาดเต็ม</p>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(28,36,48,0.72)] px-4 py-8"
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -top-3 right-0 z-10 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-[var(--bd-ink)] shadow-md hover:bg-[var(--bd-bg)] sm:-right-3"
              aria-label="ปิดรูปภาพ"
            >
              ปิด
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-[80vh] w-full rounded-xl bg-white object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
