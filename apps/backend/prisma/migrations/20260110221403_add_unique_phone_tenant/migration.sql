/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `tenants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tenants_phone_key" ON "tenants"("phone");
