-- CreateTable
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

-- CreateTable
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

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "user_wa_username_key" ON "user_wa"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_wa_email_key" ON "user_wa"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_wa_refresh_token_key" ON "user_sessions_wa"("refresh_token");

-- AddForeignKey
ALTER TABLE "user_sessions_wa" ADD CONSTRAINT "user_sessions_wa_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_wa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_items_wa" ADD CONSTRAINT "budget_items_wa_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user_wa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
