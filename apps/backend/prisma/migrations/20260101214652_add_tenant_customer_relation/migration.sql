/*
  Warnings:

  - You are about to drop the column `mp_customer_id` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `offer_notification` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `tenant_id` on the `customers` table. All the data in the column will be lost.
  - You are about to drop the column `customer_id` on the `subscriptions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[phone]` on the table `customers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenant_customer_id]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tenant_customer_id` to the `subscriptions` table without a default value. This is not possible if the table is not empty.
  - Made the column `card_token_id` on table `subscriptions` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `tenants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `saas_next_billing` on table `tenants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `saas_payment_method_id` on table `tenants` required. This step will fail if there are existing NULL values in that column.
  - Made the column `saas_plan_id` on table `tenants` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "customers" DROP CONSTRAINT "customers_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "subscriptions" DROP CONSTRAINT "subscriptions_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_saas_plan_id_fkey";

-- DropIndex
DROP INDEX "customers_tenant_id_phone_key";

-- DropIndex
DROP INDEX "subscriptions_customer_id_key";

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "mp_customer_id",
DROP COLUMN "offer_notification",
DROP COLUMN "tenant_id";

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "customer_id",
ADD COLUMN     "tenant_customer_id" TEXT NOT NULL,
ALTER COLUMN "card_token_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "tenants" ALTER COLUMN "waba_id" DROP NOT NULL,
ALTER COLUMN "phone_id" DROP NOT NULL,
ALTER COLUMN "access_token" DROP NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "saas_next_billing" SET NOT NULL,
ALTER COLUMN "saas_payment_method_id" SET NOT NULL,
ALTER COLUMN "saas_plan_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "tenant_customers" (
    "id" TEXT NOT NULL,
    "offer_notification" BOOLEAN NOT NULL DEFAULT true,
    "mp_customer_id" TEXT,
    "tenant_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_customers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_customers_tenant_id_customer_id_key" ON "tenant_customers"("tenant_id", "customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "customers_phone_key" ON "customers"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_tenant_customer_id_key" ON "subscriptions"("tenant_customer_id");

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_saas_plan_id_fkey" FOREIGN KEY ("saas_plan_id") REFERENCES "saas_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_customers" ADD CONSTRAINT "tenant_customers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_customers" ADD CONSTRAINT "tenant_customers_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_customer_id_fkey" FOREIGN KEY ("tenant_customer_id") REFERENCES "tenant_customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
