-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NULL,
    `phone` VARCHAR(30) NULL,
    `password` TEXT NULL,
    `role` ENUM('user', 'company', 'admin', 'educational_institution') NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `refresh_token` TEXT NULL,

    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `refresh_token`(`refresh_token`(191)),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
