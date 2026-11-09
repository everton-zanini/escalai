import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isChurchBlocked, CHURCH_STATUS_LABEL } from "@/lib/church";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/schedule/empty-state";
import { Church, Plus } from "lucide-react";
import { LinkPendingOverlay } from "@/components/loading-overlay";

export default async function SuperAdminPage() {
  const churches = await prisma.church.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { users: true, departments: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Igrejas</h1>
        <Button nativeButton={false} render={<Link href="/super-admin/igrejas/nova" />}>
          <Plus className="size-4" />
          Nova
        <LinkPendingOverlay /></Button>
      </div>

      {churches.length === 0 ? (
        <EmptyState icon={Church} title="Nenhuma igreja cadastrada" />
      ) : (
        <div className="space-y-2">
          {churches.map((church) => {
            const blocked = isChurchBlocked(church);
            return (
              <Link
                key={church.id}
                href={`/super-admin/igrejas/${church.id}`}
                className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{church.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {church._count.users} membros · {church._count.departments} departamentos ·
                        plano {church.plan}
                        {church.expiresAt &&
                          ` · vence ${church.expiresAt.toLocaleDateString("pt-BR", { timeZone: "UTC" })}`}
                      </p>
                    </div>
                    <Badge
                      variant={blocked || church.status === "SUSPENSA" ? "destructive" : "secondary"}
                    >
                      {blocked && church.status !== "SUSPENSA"
                        ? "Vencida"
                        : CHURCH_STATUS_LABEL[church.status]}
                    </Badge>
                  </CardContent>
                </Card>
              <LinkPendingOverlay /></Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
