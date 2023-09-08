/*
  Warnings:

  - You are about to drop the `historic` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[product_id,historic_id]` on the table `historicItems` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `price` to the `historicItems` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `historicItems` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `historic` DROP FOREIGN KEY `Historic_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `historicitems` DROP FOREIGN KEY `HistoricItems_historic_id_fkey`;

-- DropForeignKey
ALTER TABLE `historicitems` DROP FOREIGN KEY `HistoricItems_product_id_fkey`;

-- AlterTable
ALTER TABLE `historicitems` ADD COLUMN `price` DECIMAL(9, 2) NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL;

-- DropTable
DROP TABLE `historic`;

-- CreateTable
CREATE TABLE `historics` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `total_price` DECIMAL(9, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `historicItems_product_id_historic_id_key` ON `historicItems`(`product_id`, `historic_id`);

-- AddForeignKey
ALTER TABLE `historics` ADD CONSTRAINT `historics_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historicItems` ADD CONSTRAINT `historicItems_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `historicItems` ADD CONSTRAINT `historicItems_historic_id_fkey` FOREIGN KEY (`historic_id`) REFERENCES `historics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
