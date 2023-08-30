/*
  Warnings:

  - You are about to drop the column `image_url` on the `products` table. All the data in the column will be lost.
  - Added the required column `image_urls` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products` DROP COLUMN `image_url`,
    ADD COLUMN `image_urls` VARCHAR(191) NOT NULL;
