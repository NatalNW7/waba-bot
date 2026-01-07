/*
  Warnings:

  - A unique constraint covering the columns `[external_id]` on the table `subscriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "saas_plans" ADD COLUMN     "interval" "PaymentInterval" NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "external_id" TEXT;

-- AlterTable
ALTER TABLE "tenants" ALTER COLUMN "saas_next_billing" DROP NOT NULL,
ALTER COLUMN "saas_payment_method_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_external_id_key" ON "subscriptions"("external_id");
