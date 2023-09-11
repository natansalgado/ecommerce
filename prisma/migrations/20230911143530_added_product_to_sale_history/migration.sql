/*
  Warnings:

  - A unique constraint covering the columns `[product_id]` on the table `SalesHistory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `product_id` to the `SalesHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `saleshistory` DROP FOREIGN KEY `SalesHistory_buyer_id_fkey`;

-- AlterTable
ALTER TABLE `saleshistory` ADD COLUMN `product_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `SalesHistory_product_id_key` ON `SalesHistory`(`product_id`);

-- AddForeignKey
ALTER TABLE `SalesHistory` ADD CONSTRAINT `SalesHistory_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesHistory` ADD CONSTRAINT `SalesHistory_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
