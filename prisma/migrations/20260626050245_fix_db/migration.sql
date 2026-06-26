-- CreateEnum
CREATE TYPE "requirements_type" AS ENUM ('hard_skill', 'soft_skill', 'education', 'experience', 'tool', 'language', 'certification');

-- CreateEnum
CREATE TYPE "users_role" AS ENUM ('student', 'hr', 'admin', 'superadmin');

-- CreateEnum
CREATE TYPE "applications_status" AS ENUM ('new', 'reviewed', 'interview', 'accepted', 'rejected');

-- CreateEnum
CREATE TYPE "courses_level" AS ENUM ('beginner', 'intermediate', 'advanced');

-- CreateEnum
CREATE TYPE "talent_invitations_status" AS ENUM ('invited', 'responded', 'declined');

-- CreateEnum
CREATE TYPE "jobs_job_type" AS ENUM ('Full-time', 'Part-time', 'Internship', 'Contract');

-- CreateEnum
CREATE TYPE "requirements_embedding_status" AS ENUM ('pending', 'encoding', 'done', 'failed');

-- CreateEnum
CREATE TYPE "students_status" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "jobs_status" AS ENUM ('processing', 'active', 'closing', 'closed', 'draft');

-- CreateEnum
CREATE TYPE "jobs_remote_type" AS ENUM ('onsite', 'hybrid', 'remote');

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "user_id" CHAR(36),
    "name" VARCHAR(255) NOT NULL,
    "prodi_id" CHAR(36),
    "email" VARCHAR(255),
    "deleted_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_matches" (
    "application_id" CHAR(36) NOT NULL,
    "clo_id" CHAR(36) NOT NULL,
    "requirement_id" CHAR(36),
    "similarity" DOUBLE PRECISION,
    "grade_weight" DOUBLE PRECISION,
    "contribution" DOUBLE PRECISION,

    CONSTRAINT "application_matches_pkey" PRIMARY KEY ("application_id","clo_id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "student_id" CHAR(36),
    "job_id" CHAR(36),
    "match_score" DOUBLE PRECISION,
    "status" "applications_status" DEFAULT 'new',
    "applied_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clo_skills" (
    "clo_id" CHAR(36) NOT NULL,
    "skill_id" CHAR(36) NOT NULL,
    "weight" DOUBLE PRECISION DEFAULT 1,

    CONSTRAINT "clo_skills_pkey" PRIMARY KEY ("clo_id","skill_id")
);

-- CreateTable
CREATE TABLE "clos" (
    "id" TEXT NOT NULL,
    "matkul_id" CHAR(36),
    "clo_code" VARCHAR(100),
    "clo_text" TEXT NOT NULL,
    "embedding" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "industry" VARCHAR(255),
    "location" VARCHAR(255),
    "size" VARCHAR(100),
    "founded" VARCHAR(50),
    "website" TEXT,
    "logo_icon" TEXT,
    "verified" BOOLEAN DEFAULT false,
    "description" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_skills" (
    "course_id" CHAR(36) NOT NULL,
    "skill_id" CHAR(36) NOT NULL,

    CONSTRAINT "course_skills_pkey" PRIMARY KEY ("course_id","skill_id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "provider" VARCHAR(255),
    "description" TEXT,
    "level" "courses_level",
    "duration" VARCHAR(100),
    "url" TEXT,
    "thumbnail" TEXT,
    "embedding" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_versions" (
    "id" TEXT NOT NULL,
    "prodi_id" CHAR(36) NOT NULL,
    "year" INTEGER NOT NULL,
    "active" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curriculum_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grade_scale" (
    "letter" VARCHAR(5) NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "grade_scale_pkey" PRIMARY KEY ("letter")
);

-- CreateTable
CREATE TABLE "hr_profiles" (
    "id" TEXT NOT NULL,
    "user_id" CHAR(36),
    "name" VARCHAR(255) NOT NULL,
    "company_id" CHAR(36),
    "position" VARCHAR(255),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hr_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_skill_map" (
    "job_id" CHAR(36) NOT NULL,
    "skill_id" CHAR(36) NOT NULL,
    "importance" DOUBLE PRECISION DEFAULT 1,

    CONSTRAINT "job_skill_map_pkey" PRIMARY KEY ("job_id","skill_id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "hr_id" CHAR(36),
    "company_id" CHAR(36),
    "title" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255),
    "job_type" "jobs_job_type",
    "description" TEXT,
    "status" "jobs_status" DEFAULT 'processing',
    "salary" VARCHAR(255),
    "category" VARCHAR(255),
    "minimum_gpa" DOUBLE PRECISION,
    "experience_level" VARCHAR(100),
    "remote_type" "jobs_remote_type",
    "posted_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(0),
    "closed_at" TIMESTAMP(0),

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matkul" (
    "id" TEXT NOT NULL,
    "kode" VARCHAR(50) NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "sks" INTEGER,
    "semester" INTEGER,
    "deskripsi" TEXT,
    "prodi_id" CHAR(36),
    "curriculum_version_id" CHAR(36),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matkul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" CHAR(36),
    "type" VARCHAR(100),
    "payload" TEXT,
    "read_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prodi" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "fakultas" VARCHAR(255),
    "integration_status" VARCHAR(100) DEFAULT 'planned',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prodi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recommendation_explanations" (
    "id" TEXT NOT NULL,
    "application_id" CHAR(36),
    "explanation_text" TEXT,
    "top_matching_clos" TEXT,
    "missing_clos" TEXT,
    "generated_by" VARCHAR(50) DEFAULT 'ai',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_explanations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirements" (
    "id" TEXT NOT NULL,
    "job_id" CHAR(36),
    "req_text" TEXT NOT NULL,
    "type" "requirements_type",
    "embedding" TEXT,
    "embedding_status" "requirements_embedding_status" DEFAULT 'pending',
    "position" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_gaps" (
    "id" TEXT NOT NULL,
    "student_id" CHAR(36),
    "job_id" CHAR(36),
    "gap_score" DOUBLE PRECISION,
    "matched_skills" TEXT,
    "missing_skills" TEXT,
    "generated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_gaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100),
    "description" TEXT,
    "embedding" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_clos" (
    "student_id" CHAR(36) NOT NULL,
    "clo_id" CHAR(36) NOT NULL,
    "grade" VARCHAR(5),
    "semester_taken" INTEGER,
    "year_taken" INTEGER,

    CONSTRAINT "student_clos_pkey" PRIMARY KEY ("student_id","clo_id")
);

-- CreateTable
CREATE TABLE "student_courses" (
    "id" TEXT NOT NULL,
    "student_id" CHAR(36),
    "course_id" CHAR(36),
    "bookmarked" BOOLEAN DEFAULT false,
    "completed" BOOLEAN DEFAULT false,
    "progress" INTEGER DEFAULT 0,
    "started_at" TIMESTAMP(0),
    "completed_at" TIMESTAMP(0),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_skill_map" (
    "student_id" CHAR(36) NOT NULL,
    "skill_id" CHAR(36) NOT NULL,
    "source" VARCHAR(100) DEFAULT 'clo',
    "proficiency" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "student_skill_map_pkey" PRIMARY KEY ("student_id","skill_id")
);

-- CreateTable
CREATE TABLE "student_targets" (
    "id" TEXT NOT NULL,
    "student_id" CHAR(36),
    "target_role" VARCHAR(255),
    "target_company_id" CHAR(36),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "user_id" CHAR(36),
    "nim" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "prodi_id" CHAR(36),
    "angkatan" INTEGER,
    "status" "students_status" DEFAULT 'active',
    "email" VARCHAR(255),
    "bio" TEXT,
    "linkedin_url" TEXT,
    "github_url" TEXT,
    "portfolio_url" TEXT,
    "cv_url" TEXT,
    "gpa" DOUBLE PRECISION,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "actor_id" CHAR(36),
    "action" VARCHAR(255) NOT NULL,
    "entity" VARCHAR(255),
    "entity_id" CHAR(36),
    "metadata" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "talent_invitations" (
    "id" TEXT NOT NULL,
    "hr_id" CHAR(36),
    "student_id" CHAR(36),
    "job_id" CHAR(36),
    "status" "talent_invitations_status" DEFAULT 'invited',
    "sent_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responded_at" TIMESTAMP(0),

    CONSTRAINT "talent_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" "users_role" NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "refresh_token" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_user_id_key" ON "admin_users"("user_id");

-- CreateIndex
CREATE INDEX "admin_users_prodi_id_idx" ON "admin_users"("prodi_id");

-- CreateIndex
CREATE INDEX "fk_application_match_clo" ON "application_matches"("clo_id");

-- CreateIndex
CREATE INDEX "fk_application_match_requirement" ON "application_matches"("requirement_id");

-- CreateIndex
CREATE INDEX "fk_applications_job" ON "applications"("job_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_student_id_job_id_key" ON "applications"("student_id", "job_id");

-- CreateIndex
CREATE INDEX "clo_skills_skill_id_idx" ON "clo_skills"("skill_id");

-- CreateIndex
CREATE INDEX "clos_matkul_id_idx" ON "clos"("matkul_id");

-- CreateIndex
CREATE INDEX "course_skills_skill_id_idx" ON "course_skills"("skill_id");

-- CreateIndex
CREATE INDEX "curriculum_versions_prodi_id_idx" ON "curriculum_versions"("prodi_id");

-- CreateIndex
CREATE UNIQUE INDEX "hr_profiles_user_id_key" ON "hr_profiles"("user_id");

-- CreateIndex
CREATE INDEX "fk_hr_company" ON "hr_profiles"("company_id");

-- CreateIndex
CREATE INDEX "job_skill_map_skill_id_idx" ON "job_skill_map"("skill_id");

-- CreateIndex
CREATE INDEX "jobs_company_id_idx" ON "jobs"("company_id");

-- CreateIndex
CREATE INDEX "jobs_hr_id_idx" ON "jobs"("hr_id");

-- CreateIndex
CREATE UNIQUE INDEX "kode" ON "matkul"("kode");

-- CreateIndex
CREATE INDEX "matkul_curriculum_version_id_idx" ON "matkul"("curriculum_version_id");

-- CreateIndex
CREATE INDEX "matkul_prodi_id_idx" ON "matkul"("prodi_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "prodi_name_key" ON "prodi"("name");

-- CreateIndex
CREATE INDEX "recommendation_explanations_application_id_idx" ON "recommendation_explanations"("application_id");

-- CreateIndex
CREATE INDEX "requirements_job_id_idx" ON "requirements"("job_id");

-- CreateIndex
CREATE INDEX "skill_gaps_job_id_idx" ON "skill_gaps"("job_id");

-- CreateIndex
CREATE INDEX "skill_gaps_student_id_idx" ON "skill_gaps"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "name" ON "skills"("name");

-- CreateIndex
CREATE INDEX "student_clos_clo_id_idx" ON "student_clos"("clo_id");

-- CreateIndex
CREATE INDEX "student_clos_grade_idx" ON "student_clos"("grade");

-- CreateIndex
CREATE INDEX "student_courses_course_id_idx" ON "student_courses"("course_id");

-- CreateIndex
CREATE INDEX "student_courses_student_id_idx" ON "student_courses"("student_id");

-- CreateIndex
CREATE INDEX "student_skill_map_skill_id_idx" ON "student_skill_map"("skill_id");

-- CreateIndex
CREATE INDEX "student_targets_target_company_id_idx" ON "student_targets"("target_company_id");

-- CreateIndex
CREATE INDEX "student_targets_student_id_idx" ON "student_targets"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_user_id_key" ON "students"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_nim_key" ON "students"("nim");

-- CreateIndex
CREATE INDEX "fk_students_prodi" ON "students"("prodi_id");

-- CreateIndex
CREATE INDEX "talent_invitations_hr_id_idx" ON "talent_invitations"("hr_id");

-- CreateIndex
CREATE INDEX "talent_invitations_job_id_idx" ON "talent_invitations"("job_id");

-- CreateIndex
CREATE INDEX "talent_invitations_student_id_idx" ON "talent_invitations"("student_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_refresh_token_key" ON "users"("refresh_token");

-- AddForeignKey
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "application_matches" ADD CONSTRAINT "application_matches_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "application_matches" ADD CONSTRAINT "application_matches_clo_id_fkey" FOREIGN KEY ("clo_id") REFERENCES "clos"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "application_matches" ADD CONSTRAINT "application_matches_requirement_id_fkey" FOREIGN KEY ("requirement_id") REFERENCES "requirements"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "clo_skills" ADD CONSTRAINT "clo_skills_clo_id_fkey" FOREIGN KEY ("clo_id") REFERENCES "clos"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "clo_skills" ADD CONSTRAINT "clo_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "clos" ADD CONSTRAINT "clos_matkul_id_fkey" FOREIGN KEY ("matkul_id") REFERENCES "matkul"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "course_skills" ADD CONSTRAINT "course_skills_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "course_skills" ADD CONSTRAINT "course_skills_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "curriculum_versions" ADD CONSTRAINT "curriculum_versions_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "hr_profiles" ADD CONSTRAINT "hr_profiles_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "hr_profiles" ADD CONSTRAINT "fk_hr_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "job_skill_map" ADD CONSTRAINT "job_skill_map_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "job_skill_map" ADD CONSTRAINT "job_skill_map_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_hr_id_fkey" FOREIGN KEY ("hr_id") REFERENCES "hr_profiles"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "matkul" ADD CONSTRAINT "matkul_curriculum_version_id_fkey" FOREIGN KEY ("curriculum_version_id") REFERENCES "curriculum_versions"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "matkul" ADD CONSTRAINT "matkul_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "recommendation_explanations" ADD CONSTRAINT "recommendation_explanations_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "skill_gaps" ADD CONSTRAINT "skill_gaps_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "skill_gaps" ADD CONSTRAINT "skill_gaps_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "student_clos" ADD CONSTRAINT "student_clos_clo_id_fkey" FOREIGN KEY ("clo_id") REFERENCES "clos"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "student_clos" ADD CONSTRAINT "student_clos_grade_fkey" FOREIGN KEY ("grade") REFERENCES "grade_scale"("letter") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "student_clos" ADD CONSTRAINT "student_clos_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "student_courses" ADD CONSTRAINT "student_courses_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "student_courses" ADD CONSTRAINT "student_courses_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "student_skill_map" ADD CONSTRAINT "student_skill_map_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "student_skill_map" ADD CONSTRAINT "student_skill_map_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "student_targets" ADD CONSTRAINT "student_targets_target_company_id_fkey" FOREIGN KEY ("target_company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "student_targets" ADD CONSTRAINT "student_targets_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "prodi"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "talent_invitations" ADD CONSTRAINT "talent_invitations_hr_id_fkey" FOREIGN KEY ("hr_id") REFERENCES "hr_profiles"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "talent_invitations" ADD CONSTRAINT "talent_invitations_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "talent_invitations" ADD CONSTRAINT "talent_invitations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE RESTRICT;
