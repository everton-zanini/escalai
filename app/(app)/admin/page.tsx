import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [departmentCount, userCount, entryCount] = await Promise.all([
    prisma.department.count({ where: { isActive: true } }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.scheduleEntry.count(),
  ]);

  const cards = [
    { href: "/admin/departamentos", label: "Departamentos", value: departmentCount },
    { href: "/admin/usuarios", label: "Usuários", value: userCount },
    { href: "/departamentos", label: "Escalas lançadas", value: entryCount },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <Link key={card.href} href={card.href}>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{card.value}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {card.label}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
