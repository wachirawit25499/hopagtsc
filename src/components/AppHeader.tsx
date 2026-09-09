"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { APP_NAME, formatDisplayName, ROLE_LABELS } from "@/lib/constants";
import { REPAIRS_CHANGED_EVENT } from "@/lib/repair-events";
import type { SessionUser } from "@/lib/session";
import { BrandLogo } from "./BrandLogo";
import { NewRepairAlert } from "./NewRepairAlert";

export function AppHeader({ user }: { user: SessionUser }) {
  const router = useRouter();
  const pathname = usePathname();
  const isStaff = user.role === "TECHNICIAN" || user.role === "ADMIN";
  const isAdmin = user.role === "ADMIN";
  const homeHref = isStaff ? "/requests" : "/dashboard";
  const [openCount, setOpenCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isStaff) {
      return;
    }

    let cancelled = false;

    async function loadOpenCount() {
      try {
        const res = await fetch("/api/repairs/open-count", {
          cache: "no-store",
        });
        if (!res.ok) {
          return;
        }
        const data = (await res.json()) as { count?: number };
        if (!cancelled && typeof data.count === "number") {
          setOpenCount(data.count);
        }
      } catch {
        // ignore network errors for badge
      }
    }

    void loadOpenCount();
    window.addEventListener(REPAIRS_CHANGED_EVENT, loadOpenCount);

    return () => {
      cancelled = true;
      window.removeEventListener(REPAIRS_CHANGED_EVENT, loadOpenCount);
    };
  }, [isStaff, pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="border-b border-[var(--bd-line)] bg-[var(--bd-surface)]/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href={homeHref} className="flex items-center gap-3">
            <BrandLogo size={40} />
            <div>
              <p className="text-lg font-semibold tracking-tight text-[var(--bd-ink)]">
                {APP_NAME}
              </p>
              <p className="text-xs text-[var(--bd-muted)]">
                {ROLE_LABELS[user.role]} ·{" "}
              {formatDisplayName(
                user.namePrefix,
                user.firstName,
                user.lastName,
              )}
              </p>
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            {isStaff ? (
              <>
                <NavLink href="/requests" active={pathname === "/requests"}>
                  <span>คำขอแจ้งซ่อม</span>
                  {openCount !== null && (
                    <span
                      className={`ml-2 inline-flex min-w-5 items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                        activeBadgeClass(pathname === "/requests", openCount)
                      }`}
                      aria-label={`งานค้าง ${openCount} รายการ`}
                    >
                      {openCount}
                    </span>
                  )}
                </NavLink>
                <NavLink href="/history" active={pathname === "/history"}>
                  ประวัติการแจ้งซ่อม
                </NavLink>
                {isAdmin && (
                  <NavLink
                    href="/admin/database"
                    active={pathname.startsWith("/admin/database")}
                  >
                    ฐานข้อมูล
                  </NavLink>
                )}
              </>
            ) : (
              <>
                <NavLink
                  href="/dashboard"
                  active={
                    pathname === "/dashboard" ||
                    pathname.startsWith("/dashboard/")
                  }
                >
                  ประวัติการแจ้งซ่อม
                </NavLink>
                <NavLink
                  href="/repairs/new"
                  active={pathname === "/repairs/new"}
                >
                  แจ้งซ่อมใหม่
                </NavLink>
              </>
            )}
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-[var(--bd-secondary)] px-3 py-2 text-sm font-medium text-white transition hover:bg-[var(--bd-secondary-hover)]"
            >
              ออกจากระบบ
            </button>
          </nav>
        </div>
      </header>
      {isStaff && <NewRepairAlert />}
    </>
  );
}

function activeBadgeClass(active: boolean, count: number) {
  if (count === 0) {
    return active
      ? "bg-white/20 text-white"
      : "bg-[var(--bd-line)] text-[var(--bd-muted)]";
  }
  return active
    ? "bg-white text-[var(--bd-accent)]"
    : "bg-[#c45c4a] text-white";
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-[var(--bd-accent)] text-white"
          : "bg-[var(--bd-bg)] text-[var(--bd-ink)] hover:bg-[var(--bd-line)]"
      }`}
    >
      {children}
    </Link>
  );
}
