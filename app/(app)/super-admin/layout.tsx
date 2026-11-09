import { requireSuperAdmin } from "@/lib/permissions";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();

  return <div className="mx-auto w-full max-w-2xl space-y-4 p-4">{children}</div>;
}
