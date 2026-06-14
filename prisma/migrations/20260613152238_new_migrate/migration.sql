-- CreateTable
CREATE TABLE `admin_users` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` CHAR(36) NULL,
    `name` VARCHAR(255) NOT NULL,
    `prodi_id` CHAR(36) NULL,
    `email` VARCHAR(255) NULL,
    `deleted_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `user_id`(`user_id`),
    INDEX `fk_admin_prodi`(`prodi_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `application_matches` (
    `application_id` CHAR(36) NOT NULL,
    `clo_id` CHAR(36) NOT NULL,
    `requirement_id` CHAR(36) NULL,
    `similarity` DOUBLE NULL,
    `grade_weight` DOUBLE NULL,
    `contribution` DOUBLE NULL,

    INDEX `fk_application_match_clo`(`clo_id`),
    INDEX `fk_application_match_requirement`(`requirement_id`),
    PRIMARY KEY (`application_id`, `clo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `applications` (
    `id` VARCHAR(191) NOT NULL,
    `student_id` CHAR(36) NULL,
    `job_id` CHAR(36) NULL,
    `match_score` DOUBLE NULL,
    `status` ENUM('new', 'reviewed', 'interview', 'accepted', 'rejected') NULL DEFAULT 'new',
    `applied_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_applications_job`(`job_id`),
    UNIQUE INDEX `student_id`(`student_id`, `job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clo_skills` (
    `clo_id` CHAR(36) NOT NULL,
    `skill_id` CHAR(36) NOT NULL,
    `weight` DOUBLE NULL DEFAULT 1,

    INDEX `fk_clo_skills_skill`(`skill_id`),
    PRIMARY KEY (`clo_id`, `skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clos` (
    `id` VARCHAR(191) NOT NULL,
    `matkul_id` CHAR(36) NULL,
    `clo_code` VARCHAR(100) NULL,
    `clo_text` TEXT NOT NULL,
    `embedding` LONGTEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_clos_matkul`(`matkul_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `companies` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `industry` VARCHAR(255) NULL,
    `location` VARCHAR(255) NULL,
    `size` VARCHAR(100) NULL,
    `founded` VARCHAR(50) NULL,
    `website` TEXT NULL,
    `logo_icon` TEXT NULL,
    `verified` BOOLEAN NULL DEFAULT false,
    `description` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course_skills` (
    `course_id` CHAR(36) NOT NULL,
    `skill_id` CHAR(36) NOT NULL,

    INDEX `fk_course_skills_skill`(`skill_id`),
    PRIMARY KEY (`course_id`, `skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `courses` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `provider` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `level` ENUM('beginner', 'intermediate', 'advanced') NULL,
    `duration` VARCHAR(100) NULL,
    `url` TEXT NULL,
    `thumbnail` TEXT NULL,
    `embedding` LONGTEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curriculum_versions` (
    `id` VARCHAR(191) NOT NULL,
    `prodi_id` CHAR(36) NOT NULL,
    `year` INTEGER NOT NULL,
    `active` BOOLEAN NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_curriculum_prodi`(`prodi_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grade_scale` (
    `letter` VARCHAR(5) NOT NULL,
    `weight` DOUBLE NOT NULL,

    PRIMARY KEY (`letter`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hr_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` CHAR(36) NULL,
    `name` VARCHAR(255) NOT NULL,
    `company_id` CHAR(36) NULL,
    `position` VARCHAR(255) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `user_id`(`user_id`),
    INDEX `fk_hr_company`(`company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `job_skill_map` (
    `job_id` CHAR(36) NOT NULL,
    `skill_id` CHAR(36) NOT NULL,
    `importance` DOUBLE NULL DEFAULT 1,

    INDEX `fk_job_skill_skill`(`skill_id`),
    PRIMARY KEY (`job_id`, `skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` VARCHAR(191) NOT NULL,
    `hr_id` CHAR(36) NULL,
    `company_id` CHAR(36) NULL,
    `title` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NULL,
    `job_type` ENUM('Full-time', 'Part-time', 'Internship', 'Contract') NULL,
    `description` TEXT NULL,
    `status` ENUM('processing', 'active', 'closing', 'closed', 'draft') NULL DEFAULT 'processing',
    `salary` VARCHAR(255) NULL,
    `category` VARCHAR(255) NULL,
    `minimum_gpa` DOUBLE NULL,
    `experience_level` VARCHAR(100) NULL,
    `remote_type` ENUM('onsite', 'hybrid', 'remote') NULL,
    `posted_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `deadline` TIMESTAMP(0) NULL,
    `closed_at` TIMESTAMP(0) NULL,

    INDEX `fk_jobs_company`(`company_id`),
    INDEX `fk_jobs_hr`(`hr_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matkul` (
    `id` VARCHAR(191) NOT NULL,
    `kode` VARCHAR(50) NOT NULL,
    `nama` VARCHAR(255) NOT NULL,
    `sks` INTEGER NULL,
    `semester` INTEGER NULL,
    `deskripsi` TEXT NULL,
    `prodi_id` CHAR(36) NULL,
    `curriculum_version_id` CHAR(36) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `kode`(`kode`),
    INDEX `fk_matkul_curriculum`(`curriculum_version_id`),
    INDEX `fk_matkul_prodi`(`prodi_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` CHAR(36) NULL,
    `type` VARCHAR(100) NULL,
    `payload` LONGTEXT NULL,
    `read_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_notifications_user`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prodi` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `fakultas` VARCHAR(255) NULL,
    `integration_status` VARCHAR(100) NULL DEFAULT 'planned',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recommendation_explanations` (
    `id` VARCHAR(191) NOT NULL,
    `application_id` CHAR(36) NULL,
    `explanation_text` TEXT NULL,
    `top_matching_clos` LONGTEXT NULL,
    `missing_clos` LONGTEXT NULL,
    `generated_by` VARCHAR(50) NULL DEFAULT 'ai',
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_recommendation_application`(`application_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requirements` (
    `id` VARCHAR(191) NOT NULL,
    `job_id` CHAR(36) NULL,
    `req_text` TEXT NOT NULL,
    `type` ENUM('hard_skill', 'soft_skill', 'education', 'experience', 'tool', 'language', 'certification') NULL,
    `embedding` LONGTEXT NULL,
    `embedding_status` ENUM('pending', 'encoding', 'done', 'failed') NULL DEFAULT 'pending',
    `position` INTEGER NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_requirements_job`(`job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skill_gaps` (
    `id` VARCHAR(191) NOT NULL,
    `student_id` CHAR(36) NULL,
    `job_id` CHAR(36) NULL,
    `gap_score` DOUBLE NULL,
    `matched_skills` LONGTEXT NULL,
    `missing_skills` LONGTEXT NULL,
    `generated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_skill_gap_job`(`job_id`),
    INDEX `fk_skill_gap_student`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skills` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `embedding` LONGTEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_clos` (
    `student_id` CHAR(36) NOT NULL,
    `clo_id` CHAR(36) NOT NULL,
    `grade` VARCHAR(5) NULL,
    `semester_taken` INTEGER NULL,
    `year_taken` INTEGER NULL,

    INDEX `fk_student_clos_clo`(`clo_id`),
    INDEX `fk_student_clos_grade`(`grade`),
    PRIMARY KEY (`student_id`, `clo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_courses` (
    `id` VARCHAR(191) NOT NULL,
    `student_id` CHAR(36) NULL,
    `course_id` CHAR(36) NULL,
    `bookmarked` BOOLEAN NULL DEFAULT false,
    `completed` BOOLEAN NULL DEFAULT false,
    `progress` INTEGER NULL DEFAULT 0,
    `started_at` TIMESTAMP(0) NULL,
    `completed_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_student_courses_course`(`course_id`),
    INDEX `fk_student_courses_student`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_skill_map` (
    `student_id` CHAR(36) NOT NULL,
    `skill_id` CHAR(36) NOT NULL,
    `source` VARCHAR(100) NULL DEFAULT 'clo',
    `proficiency` DOUBLE NULL DEFAULT 0,

    INDEX `fk_student_skill_skill`(`skill_id`),
    PRIMARY KEY (`student_id`, `skill_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_targets` (
    `id` VARCHAR(191) NOT NULL,
    `student_id` CHAR(36) NULL,
    `target_role` VARCHAR(255) NULL,
    `target_company_id` CHAR(36) NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_student_target_company`(`target_company_id`),
    INDEX `fk_student_target_student`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `students` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` CHAR(36) NULL,
    `nim` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `prodi_id` CHAR(36) NULL,
    `angkatan` INTEGER NULL,
    `status` ENUM('active', 'inactive') NULL DEFAULT 'active',
    `email` VARCHAR(255) NULL,
    `bio` TEXT NULL,
    `linkedin_url` TEXT NULL,
    `github_url` TEXT NULL,
    `portfolio_url` TEXT NULL,
    `cv_url` TEXT NULL,
    `gpa` DOUBLE NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `user_id`(`user_id`),
    UNIQUE INDEX `nim`(`nim`),
    INDEX `fk_students_prodi`(`prodi_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_logs` (
    `id` VARCHAR(191) NOT NULL,
    `actor_id` CHAR(36) NULL,
    `action` VARCHAR(255) NOT NULL,
    `entity` VARCHAR(255) NULL,
    `entity_id` CHAR(36) NULL,
    `metadata` LONGTEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `talent_invitations` (
    `id` VARCHAR(191) NOT NULL,
    `hr_id` CHAR(36) NULL,
    `student_id` CHAR(36) NULL,
    `job_id` CHAR(36) NULL,
    `status` ENUM('invited', 'responded', 'declined') NULL DEFAULT 'invited',
    `sent_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `responded_at` TIMESTAMP(0) NULL,

    INDEX `fk_talent_invitation_hr`(`hr_id`),
    INDEX `fk_talent_invitation_job`(`job_id`),
    INDEX `fk_talent_invitation_student`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('student', 'hr', 'admin', 'superadmin') NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `refresh_token` VARCHAR(191) NULL,

    UNIQUE INDEX `email`(`email`),
    UNIQUE INDEX `users_refresh_token_key`(`refresh_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin_users` ADD CONSTRAINT `fk_admin_prodi` FOREIGN KEY (`prodi_id`) REFERENCES `prodi`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `admin_users` ADD CONSTRAINT `fk_admin_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `application_matches` ADD CONSTRAINT `fk_application_match_application` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `application_matches` ADD CONSTRAINT `fk_application_match_clo` FOREIGN KEY (`clo_id`) REFERENCES `clos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `application_matches` ADD CONSTRAINT `fk_application_match_requirement` FOREIGN KEY (`requirement_id`) REFERENCES `requirements`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `fk_applications_job` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `fk_applications_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `clo_skills` ADD CONSTRAINT `fk_clo_skills_clo` FOREIGN KEY (`clo_id`) REFERENCES `clos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `clo_skills` ADD CONSTRAINT `fk_clo_skills_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `clos` ADD CONSTRAINT `fk_clos_matkul` FOREIGN KEY (`matkul_id`) REFERENCES `matkul`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `course_skills` ADD CONSTRAINT `fk_course_skills_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `course_skills` ADD CONSTRAINT `fk_course_skills_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `curriculum_versions` ADD CONSTRAINT `fk_curriculum_prodi` FOREIGN KEY (`prodi_id`) REFERENCES `prodi`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `hr_profiles` ADD CONSTRAINT `fk_hr_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `hr_profiles` ADD CONSTRAINT `fk_hr_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `job_skill_map` ADD CONSTRAINT `fk_job_skill_job` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `job_skill_map` ADD CONSTRAINT `fk_job_skill_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `fk_jobs_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `fk_jobs_hr` FOREIGN KEY (`hr_id`) REFERENCES `hr_profiles`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `matkul` ADD CONSTRAINT `fk_matkul_curriculum` FOREIGN KEY (`curriculum_version_id`) REFERENCES `curriculum_versions`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `matkul` ADD CONSTRAINT `fk_matkul_prodi` FOREIGN KEY (`prodi_id`) REFERENCES `prodi`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `recommendation_explanations` ADD CONSTRAINT `fk_recommendation_application` FOREIGN KEY (`application_id`) REFERENCES `applications`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `requirements` ADD CONSTRAINT `fk_requirements_job` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `skill_gaps` ADD CONSTRAINT `fk_skill_gap_job` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `skill_gaps` ADD CONSTRAINT `fk_skill_gap_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `student_clos` ADD CONSTRAINT `fk_student_clos_clo` FOREIGN KEY (`clo_id`) REFERENCES `clos`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `student_clos` ADD CONSTRAINT `fk_student_clos_grade` FOREIGN KEY (`grade`) REFERENCES `grade_scale`(`letter`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `student_clos` ADD CONSTRAINT `fk_student_clos_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `student_courses` ADD CONSTRAINT `fk_student_courses_course` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `student_courses` ADD CONSTRAINT `fk_student_courses_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `student_skill_map` ADD CONSTRAINT `fk_student_skill_skill` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `student_skill_map` ADD CONSTRAINT `fk_student_skill_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `student_targets` ADD CONSTRAINT `fk_student_target_company` FOREIGN KEY (`target_company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `student_targets` ADD CONSTRAINT `fk_student_target_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `fk_students_prodi` FOREIGN KEY (`prodi_id`) REFERENCES `prodi`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `talent_invitations` ADD CONSTRAINT `fk_talent_invitation_hr` FOREIGN KEY (`hr_id`) REFERENCES `hr_profiles`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `talent_invitations` ADD CONSTRAINT `fk_talent_invitation_job` FOREIGN KEY (`job_id`) REFERENCES `jobs`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `talent_invitations` ADD CONSTRAINT `fk_talent_invitation_student` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
