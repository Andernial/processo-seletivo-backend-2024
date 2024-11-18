/*
  Warnings:

  - A unique constraint covering the columns `[name,id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "User_name_id_key" ON "User"("name", "id");
