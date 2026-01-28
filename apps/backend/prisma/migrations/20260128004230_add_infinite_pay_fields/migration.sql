-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('MERCADO_PAGO', 'INFINITE_PAY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentMethod" ADD VALUE 'DEBIT_CARD';
ALTER TYPE "PaymentMethod" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "infinite_pay_slug" TEXT;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "infinite_pay_tag" TEXT,
ADD COLUMN     "preferred_payment_provider" "PaymentProvider";
