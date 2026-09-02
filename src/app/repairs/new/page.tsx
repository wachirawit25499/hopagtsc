import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { NewRepairForm } from "@/components/NewRepairForm";
import { requireUser } from "@/lib/session";

export default async function NewRepairPage() {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role !== "TENANT") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen">
      <AppHeader user={user} />
      <NewRepairForm />
    </div>
  );
}
