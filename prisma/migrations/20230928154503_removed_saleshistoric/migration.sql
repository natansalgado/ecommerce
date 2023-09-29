/*
  Warnings:

  - You are about to drop the `saleshistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `saleshistory` DROP FOREIGN KEY `SalesHistory_buyer_id_fkey`;

-- DropForeignKey
ALTER TABLE `saleshistory` DROP FOREIGN KEY `SalesHistory_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `saleshistory` DROP FOREIGN KEY `SalesHistory_store_id_fkey`;

-- AlterTable
ALTER TABLE `historicitems` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `stores` ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- DropTable
DROP TABLE `saleshistory`;
