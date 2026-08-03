-- DropIndex
DROP INDEX "schedule_assignments_schedule_entry_id_user_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "schedule_assignments_schedule_entry_id_user_id_position_id_key" ON "schedule_assignments"("schedule_entry_id", "user_id", "position_id");
