/*
  Warnings:

  - A unique constraint covering the columns `[refresh_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `users_refresh_token_key` ON `users`;

-- AlterTable
ALTER TABLE `users` MODIFY `refresh_token` TEXT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `refresh_token` ON `users`(`refresh_token`(191));
