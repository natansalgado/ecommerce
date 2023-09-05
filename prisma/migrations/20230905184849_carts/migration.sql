/*
  Warnings:

  - You are about to drop the column `created_at` on the `cartitems` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `cartitems` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cart_id,product_id]` on the table `cartItems` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `cartitems` DROP COLUMN `created_at`,
    DROP COLUMN `updated_at`;

-- AlterTable
ALTER TABLE `carts` ALTER COLUMN `updated_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `products` ALTER COLUMN `updated_at` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` ALTER COLUMN `updated_at` DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX `cartItems_cart_id_product_id_key` ON `cartItems`(`cart_id`, `product_id`);
