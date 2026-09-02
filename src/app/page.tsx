import { redirect } from "next/navigation";
import { homePathForRole } from "@/lib/auth-guards";
import { requireUser } from "@/lib/session";

export default async function HomePage() {
  const user = await requireUser();
  redirect(user ? homePathForRole(user.role) : "/login");
}
