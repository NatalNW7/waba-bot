/*
  This migration makes Customer.name required (NOT NULL).

  WARNING: This will DELETE all customers with NULL names and their related records.
  This is a DESTRUCTIVE migration.

  Steps:
  1. Delete related records (tenant_customers, appointments, payments, conversation_messages)
  2. Delete customers with NULL names
  3. Apply NOT NULL constraint
*/

-- Step 1: Delete related records for customers with NULL names
DELETE FROM "conversation_messages" WHERE "customer_id" IN (SELECT id FROM "customers" WHERE "name" IS NULL);
DELETE FROM "payments" WHERE "customer_id" IN (SELECT id FROM "customers" WHERE "name" IS NULL);
DELETE FROM "appointments" WHERE "customer_id" IN (SELECT id FROM "customers" WHERE "name" IS NULL);
DELETE FROM "tenant_customers" WHERE "customer_id" IN (SELECT id FROM "customers" WHERE "name" IS NULL);

-- Step 2: Delete customers with NULL names
DELETE FROM "customers" WHERE "name" IS NULL;

-- Step 3: AlterTable - make name NOT NULL
ALTER TABLE "customers" ALTER COLUMN "name" SET NOT NULL;
