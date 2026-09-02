import { redirect } from "next/navigation";
import { requireUser, type SessionUser } from "@/lib/session";

export async function requireAuthUser(): Promise<SessionUser> {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireStaffUser(): Promise<SessionUser> {
  const user = await requireAuthUser();
  if (user.role !== "TECHNICIAN" && user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

export async function requireTenantUser(): Promise<SessionUser> {
  const user = await requireAuthUser();
  if (user.role !== "TENANT") {
    redirect(homePathForRole(user.role));
  }
  return user;
}

export async function requireAdminUser(): Promise<SessionUser> {
  const user = await requireAuthUser();
  if (user.role !== "ADMIN") {
    redirect(homePathForRole(user.role));
  }
  return user;
}

export function isStaff(user: SessionUser) {
  return user.role === "TECHNICIAN" || user.role === "ADMIN";
}

export function homePathForRole(role: SessionUser["role"]) {
  return role === "TENANT" ? "/dashboard" : "/requests";
}
