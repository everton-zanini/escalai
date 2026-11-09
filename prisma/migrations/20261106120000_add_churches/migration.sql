-- CreateEnum
CREATE TYPE "ChurchStatus" AS ENUM ('TRIAL', 'ATIVA', 'SUSPENSA');

-- CreateTable
CREATE TABLE "churches" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "ChurchStatus" NOT NULL DEFAULT 'TRIAL',
    "plan" TEXT NOT NULL DEFAULT 'basico',
    "expires_at" TIMESTAMPTZ(6),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "churches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "churches_slug_key" ON "churches"("slug");

-- AlterTable (church_id de departments entra nullable para o backfill)
ALTER TABLE "users" ADD COLUMN "church_id" INTEGER,
ADD COLUMN "is_super_admin" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "departments" ADD COLUMN "church_id" INTEGER;

-- Backfill: dados atuais viram a primeira igreja
INSERT INTO "churches" ("name", "slug", "status", "plan", "updated_at")
VALUES ('Igreja Padrão', 'igreja-padrao', 'ATIVA', 'basico', CURRENT_TIMESTAMP);

UPDATE "users" SET "church_id" = (SELECT "id" FROM "churches" WHERE "slug" = 'igreja-padrao');
UPDATE "departments" SET "church_id" = (SELECT "id" FROM "churches" WHERE "slug" = 'igreja-padrao');

-- O admin mais antigo vira super-admin (o seed mantém o ADMIN_EMAIL como super-admin)
UPDATE "users" SET "is_super_admin" = true
WHERE "id" = (SELECT MIN("id") FROM "users" WHERE "is_admin" = true);

-- Nomes de departamento duplicados quebrariam o novo unique (church_id, name)
UPDATE "departments" d
SET "name" = d."name" || ' (' || d."id" || ')'
WHERE d."id" NOT IN (
    SELECT MIN("id") FROM "departments" GROUP BY "church_id", "name"
);

ALTER TABLE "departments" ALTER COLUMN "church_id" SET NOT NULL;

-- CreateIndex
CREATE INDEX "users_church_id_idx" ON "users"("church_id");
CREATE UNIQUE INDEX "departments_church_id_name_key" ON "departments"("church_id", "name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "departments" ADD CONSTRAINT "departments_church_id_fkey" FOREIGN KEY ("church_id") REFERENCES "churches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
