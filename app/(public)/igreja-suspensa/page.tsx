import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function IgrejaSuspensaPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-primary/10 via-background to-background px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-xl">Acesso suspenso</CardTitle>
          <CardDescription>
            O acesso da sua igreja está suspenso ou expirou. Fale com o responsável pela sua
            igreja para regularizar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <Button type="submit" variant="outline" className="w-full">
              Sair
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
