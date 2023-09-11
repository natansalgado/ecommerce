/*
  Warnings:

  - Added the required column `price` to the `SalesHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `SalesHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `saleshistory` ADD COLUMN `price` DECIMAL(9, 2) NOT NULL,
    ADD COLUMN `quantity` INTEGER NOT NULL;
