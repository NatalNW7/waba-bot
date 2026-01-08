/*
  Warnings:

  - Added the required column `updated_at` to the `tenant_customers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tenant_customers" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
