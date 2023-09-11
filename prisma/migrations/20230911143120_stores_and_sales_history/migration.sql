/*
  Warnings:

  - You are about to drop the column `vendor_id` on the `products` table. All the data in the column will be lost.
  - Added the required column `store_id` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_vendor_id_fkey`;

-- AlterTable
ALTER TABLE `products` DROP COLUMN `vendor_id`,
    ADD COLUMN `store_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Stores` (
    `id` VARCHAR(191) NOT NULL,
    `owner_id` VARCHAR(191) NOT NULL,
    `balance` DECIMAL(9, 2) NOT NULL,

    UNIQUE INDEX `Stores_owner_id_key`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalesHistory` (
    `id` VARCHAR(191) NOT NULL,
    `store_id` VARCHAR(191) NOT NULL,
    `buyer_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `SalesHistory_store_id_key`(`store_id`),
    UNIQUE INDEX `SalesHistory_buyer_id_key`(`buyer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Stores` ADD CONSTRAINT `Stores_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesHistory` ADD CONSTRAINT `SalesHistory_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `Stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalesHistory` ADD CONSTRAINT `SalesHistory_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
