-- CreateEnum
CREATE TYPE "AvailabilityRequestStatus" AS ENUM ('PENDENTE', 'APROVADA', 'RECUSADA');

-- CreateTable
CREATE TABLE "availability_requests" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "department_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "AvailabilityRequestStatus" NOT NULL DEFAULT 'PENDENTE',
    "reviewed_by_id" INTEGER,
    "reviewed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "availability_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "availability_requests_department_id_date_idx" ON "availability_requests"("department_id", "date");

-- CreateIndex
CREATE INDEX "availability_requests_user_id_idx" ON "availability_requests"("user_id");

-- AddForeignKey
ALTER TABLE "availability_requests" ADD CONSTRAINT "availability_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_requests" ADD CONSTRAINT "availability_requests_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_requests" ADD CONSTRAINT "availability_requests_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
