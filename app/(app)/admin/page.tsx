import Link from "next/link";
import { Building2, CalendarDays, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [departmentCount, userCount, entryCount] = await Promise.all([
    prisma.department.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.scheduleEntry.count(),
  ]);

  const cards = [
    { href: "/admin/departamentos", label: "Departamentos", value: departmentCount, icon: Building2 },
    { href: "/admin/usuarios", label: "Membros", value: userCount, icon: Users },
    { href: "/departamentos", label: "Escalas lançadas", value: entryCount, icon: CalendarDays },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Painel</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map(({ href, label, value, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </div>
                <CardTitle className="text-3xl font-semibold tabular-nums">{value}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{label}</CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
