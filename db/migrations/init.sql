-- PostgreSQL Database Initialization Script
-- Combines all migration scripts into a single initialization file

-- Create Users Table
CREATE TABLE "user_wa" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "token_version" INTEGER NOT NULL DEFAULT 0,
    "last_login" TIMESTAMP(3),
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" INTEGER,
    "updated_by" INTEGER,
    "maxSessionCount" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "user_wa_pkey" PRIMARY KEY ("id")
);

-- Create unique indices for user table
CREATE UNIQUE INDEX "user_wa_username_key" ON "user_wa"("username");
CREATE UNIQUE INDEX "user_wa_email_key" ON "user_wa"("email");

-- Create Sessions Table
CREATE TABLE "user_sessions_wa" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_sessions_wa_pkey" PRIMARY KEY ("id")
);

-- Create unique index for refresh tokens
CREATE UNIQUE INDEX "user_sessions_wa_refresh_token_key" ON "user_sessions_wa"("refresh_token");

-- Create Budget Items Table
CREATE TABLE "budget_items_wa" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "item_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_items_wa_pkey" PRIMARY KEY ("id")
);

-- Add Foreign Key Constraints
ALTER TABLE "user_sessions_wa" ADD CONSTRAINT "user_sessions_wa_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "user_wa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "budget_items_wa" ADD CONSTRAINT "budget_items_wa_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "user_wa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create Admin User (Optional - uncomment if needed)
-- INSERT INTO "user_wa" ("username", "email", "password_hash", "role", "is_active", "is_email_verified", "updated_at") 
-- VALUES ('admin', 'admin@example.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', 'admin', true, true, CURRENT_TIMESTAMP); 