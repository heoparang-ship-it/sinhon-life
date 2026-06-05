ALTER TABLE "couples"
ADD COLUMN "preferred_wedding_style" TEXT,
ADD COLUMN "move_in_plan_at" DATE;

ALTER TABLE "couple_members"
ADD COLUMN "phone_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "work_region" TEXT,
ADD COLUMN "income_range" TEXT,
ADD COLUMN "asset_range" TEXT,
ADD COLUMN "onboarding_status" TEXT NOT NULL DEFAULT 'not_started',
ADD COLUMN "onboarding_completed_at" TIMESTAMPTZ(6);

CREATE INDEX "idx_couple_members_onboarding_status" ON "couple_members"("onboarding_status");
