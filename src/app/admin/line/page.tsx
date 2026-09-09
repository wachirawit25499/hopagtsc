import { redirect } from "next/navigation";
import { requireAdminUser } from "@/lib/auth-guards";

export default async function AdminLinePage() {
  await requireAdminUser();
  redirect("/admin/database");
}
