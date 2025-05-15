/*
  Warnings:

  - You are about to drop the column `cashTendered` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `changeDue` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "cashTendered",
DROP COLUMN "changeDue";
