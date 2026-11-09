import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Defina ADMIN_EMAIL e ADMIN_PASSWORD no .env antes de rodar o seed."
    );
  }

  const passwordHash = await hashPassword(password);

  const church = await prisma.church.upsert({
    where: { slug: "igreja-padrao" },
    update: {},
    create: { name: "Igreja Padrão", slug: "igreja-padrao", status: "ATIVA" },
  });

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      isAdmin: true,
      isSuperAdmin: true,
      isActive: true,
    },
    create: {
      name: "Administrador",
      email,
      passwordHash,
      isAdmin: true,
      isSuperAdmin: true,
      churchId: church.id,
    },
  });

  console.log(`Super-admin pronto: ${admin.email} (id ${admin.id}), igreja ${church.slug}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
