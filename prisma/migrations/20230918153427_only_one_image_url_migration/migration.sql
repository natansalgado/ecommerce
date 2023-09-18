/*
  Warnings:

  - You are about to drop the column `image_urls` on the `products` table. All the data in the column will be lost.
  - Added the required column `image_url` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products` DROP COLUMN `image_urls`,
    ADD COLUMN `image_url` VARCHAR(191) NOT NULL;
