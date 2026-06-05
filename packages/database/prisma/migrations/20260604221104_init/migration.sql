-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "display_name" TEXT,
    "email_encrypted" TEXT,
    "email_hash" TEXT,
    "phone_encrypted" TEXT,
    "phone_hash" TEXT,
    "auth_provider" TEXT NOT NULL,
    "auth_provider_user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couples" (
    "id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "lifecycle_status" TEXT NOT NULL,
    "wedding_date" DATE,
    "wedding_region" TEXT,
    "preferred_residence_region" TEXT,
    "housing_type" TEXT,
    "total_budget_range" TEXT,
    "total_budget_amount" BIGINT,
    "cash_on_hand_range" TEXT,
    "cash_on_hand_amount" BIGINT,
    "family_support_type" TEXT,
    "loan_consideration_status" TEXT,
    "children_plan_status" TEXT,
    "onboarding_status" TEXT NOT NULL,
    "created_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "couples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_members" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "display_label" TEXT,
    "invited_by_user_id" UUID,
    "invited_at" TIMESTAMPTZ(6),
    "joined_at" TIMESTAMPTZ(6),
    "left_at" TIMESTAMPTZ(6),
    "visibility_preference" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "couple_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "couple_invitations" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "invited_by_user_id" UUID NOT NULL,
    "invited_user_id" UUID,
    "token_hash" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "accepted_at" TIMESTAMPTZ(6),
    "accepted_by_user_id" UUID,
    "canceled_at" TIMESTAMPTZ(6),
    "rejected_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "couple_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenarios" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "calculation_version" TEXT NOT NULL,
    "input_snapshot" JSONB NOT NULL,
    "total_amount" BIGINT,
    "monthly_amount" BIGINT,
    "shortfall_amount" BIGINT,
    "risk_flags" JSONB,
    "contains_sample_value" BOOLEAN NOT NULL DEFAULT false,
    "created_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario_items" (
    "id" UUID NOT NULL,
    "scenario_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "amount_type" TEXT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "source_type" TEXT,
    "source_url" TEXT,
    "note" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "scenario_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_programs" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "provider_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "region" TEXT,
    "summary" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "source_updated_at" TIMESTAMPTZ(6),
    "verified_at" TIMESTAMPTZ(6),
    "application_start_at" TIMESTAMPTZ(6),
    "application_end_at" TIMESTAMPTZ(6),
    "status" TEXT NOT NULL,
    "caution_text" TEXT,
    "required_documents_summary" JSONB,
    "created_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "policy_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "policy_rule_versions" (
    "id" UUID NOT NULL,
    "policy_program_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "rule_summary" TEXT NOT NULL,
    "eligibility_criteria" JSONB NOT NULL,
    "required_inputs" JSONB,
    "result_reason_template" JSONB,
    "required_documents" JSONB,
    "effective_from" TIMESTAMPTZ(6),
    "effective_to" TIMESTAMPTZ(6),
    "source_url" TEXT NOT NULL,
    "source_updated_at" TIMESTAMPTZ(6),
    "verified_at" TIMESTAMPTZ(6),
    "created_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policy_rule_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "eligibility_results" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "policy_program_id" UUID NOT NULL,
    "policy_rule_version_id" UUID NOT NULL,
    "result_status" TEXT NOT NULL,
    "result_reason" TEXT NOT NULL,
    "missing_inputs" JSONB,
    "required_documents" JSONB,
    "input_snapshot" JSONB NOT NULL,
    "checked_at" TIMESTAMPTZ(6) NOT NULL,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eligibility_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "region" TEXT,
    "description" TEXT,
    "business_identifier_encrypted" TEXT,
    "business_identifier_hash" TEXT,
    "representative_contact_name_encrypted" TEXT,
    "representative_contact_phone_encrypted" TEXT,
    "representative_contact_phone_hash" TEXT,
    "status" TEXT NOT NULL,
    "verification_status" TEXT NOT NULL,
    "verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_branches" (
    "id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "address" TEXT,
    "contact_phone_encrypted" TEXT,
    "contact_phone_hash" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "vendor_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" UUID NOT NULL,
    "vendor_id" UUID NOT NULL,
    "vendor_branch_id" UUID,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "region" TEXT,
    "summary" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_price_versions" (
    "id" UUID NOT NULL,
    "offer_id" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "base_price" BIGINT NOT NULL,
    "estimated_total_price" BIGINT NOT NULL,
    "included_items" JSONB NOT NULL,
    "required_options" JSONB,
    "optional_options" JSONB,
    "additional_cost_note" TEXT,
    "cancellation_policy_summary" TEXT,
    "verification_status" TEXT NOT NULL,
    "verified_at" TIMESTAMPTZ(6),
    "valid_from" TIMESTAMPTZ(6),
    "valid_until" TIMESTAMPTZ(6),
    "source_type" TEXT,
    "source_url" TEXT,
    "created_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_price_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compare_rooms" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_by_user_id" UUID,
    "shared_at" TIMESTAMPTZ(6),
    "both_approved_at" TIMESTAMPTZ(6),
    "rejected_at" TIMESTAMPTZ(6),
    "archived_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "compare_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compare_cards" (
    "id" UUID NOT NULL,
    "compare_room_id" UUID NOT NULL,
    "offer_id" UUID NOT NULL,
    "offer_price_version_id" UUID NOT NULL,
    "snapshot_title" TEXT NOT NULL,
    "snapshot_price_summary" JSONB NOT NULL,
    "snapshot_included_items" JSONB,
    "snapshot_required_options" JSONB,
    "snapshot_optional_options" JSONB,
    "position" INTEGER NOT NULL,
    "added_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removed_at" TIMESTAMPTZ(6),

    CONSTRAINT "compare_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approvals" (
    "id" UUID NOT NULL,
    "compare_room_id" UUID NOT NULL,
    "compare_card_id" UUID,
    "couple_member_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "comment" TEXT,
    "decided_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compare_comments" (
    "id" UUID NOT NULL,
    "compare_room_id" UUID NOT NULL,
    "compare_card_id" UUID,
    "couple_member_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "compare_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_requests" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "compare_room_id" UUID NOT NULL,
    "compare_card_id" UUID,
    "offer_id" UUID,
    "vendor_id" UUID NOT NULL,
    "offer_price_version_id" UUID,
    "status" TEXT NOT NULL,
    "preferred_contact_method" TEXT NOT NULL,
    "preferred_contact_dates" JSONB,
    "contact_name_encrypted" TEXT,
    "contact_phone_encrypted" TEXT,
    "contact_phone_hash" TEXT,
    "message_encrypted" TEXT,
    "consent_given_at" TIMESTAMPTZ(6) NOT NULL,
    "submitted_by_user_id" UUID NOT NULL,
    "submitted_at" TIMESTAMPTZ(6) NOT NULL,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "lead_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lead_status_histories" (
    "id" UUID NOT NULL,
    "lead_request_id" UUID NOT NULL,
    "from_status" TEXT,
    "to_status" TEXT NOT NULL,
    "changed_by_user_id" UUID,
    "changed_by_role" TEXT,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decision_logs" (
    "id" UUID NOT NULL,
    "couple_id" UUID,
    "actor_user_id" UUID,
    "actor_couple_member_id" UUID,
    "target_type" TEXT NOT NULL,
    "target_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "before_status" TEXT,
    "after_status" TEXT,
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decision_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "document_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "source_type" TEXT,
    "source_id" UUID,
    "owner_couple_member_id" UUID,
    "due_at" TIMESTAMPTZ(6),
    "attachment_ref_encrypted" TEXT,
    "attachment_provider" TEXT,
    "original_file_name_encrypted" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "couple_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "source_type" TEXT,
    "source_id" UUID,
    "assigned_couple_member_id" UUID,
    "due_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "created_by_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "couple_id" UUID,
    "user_id" UUID,
    "couple_member_id" UUID,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "scheduled_at" TIMESTAMPTZ(6),
    "sent_at" TIMESTAMPTZ(6),
    "read_at" TIMESTAMPTZ(6),
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "articles" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "seo_title" TEXT,
    "seo_description" TEXT,
    "og_image_url" TEXT,
    "published_at" TIMESTAMPTZ(6),
    "author_user_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_logs" (
    "id" UUID NOT NULL,
    "event_name" TEXT NOT NULL,
    "user_id" UUID,
    "couple_id" UUID,
    "anonymous_id" TEXT,
    "source" TEXT NOT NULL,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_users_status" ON "users"("status");

-- CreateIndex
CREATE INDEX "idx_users_email_hash" ON "users"("email_hash");

-- CreateIndex
CREATE INDEX "idx_users_phone_hash" ON "users"("phone_hash");

-- CreateIndex
CREATE UNIQUE INDEX "users_auth_provider_auth_provider_user_id_key" ON "users"("auth_provider", "auth_provider_user_id");

-- CreateIndex
CREATE INDEX "idx_couples_created_by_user_id" ON "couples"("created_by_user_id");

-- CreateIndex
CREATE INDEX "idx_couples_lifecycle_status" ON "couples"("lifecycle_status");

-- CreateIndex
CREATE INDEX "idx_couples_onboarding_status" ON "couples"("onboarding_status");

-- CreateIndex
CREATE INDEX "idx_couples_wedding_region" ON "couples"("wedding_region");

-- CreateIndex
CREATE INDEX "idx_couples_preferred_residence_region" ON "couples"("preferred_residence_region");

-- CreateIndex
CREATE INDEX "idx_couple_members_couple_id" ON "couple_members"("couple_id");

-- CreateIndex
CREATE INDEX "idx_couple_members_user_id" ON "couple_members"("user_id");

-- CreateIndex
CREATE INDEX "idx_couple_members_status" ON "couple_members"("status");

-- CreateIndex
CREATE INDEX "idx_couple_members_role" ON "couple_members"("role");

-- CreateIndex
CREATE UNIQUE INDEX "couple_members_couple_id_user_id_key" ON "couple_members"("couple_id", "user_id");

-- CreateIndex
CREATE INDEX "idx_couple_invitations_couple_id" ON "couple_invitations"("couple_id");

-- CreateIndex
CREATE INDEX "idx_couple_invitations_status" ON "couple_invitations"("status");

-- CreateIndex
CREATE INDEX "idx_couple_invitations_expires_at" ON "couple_invitations"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "couple_invitations_token_hash_key" ON "couple_invitations"("token_hash");

-- CreateIndex
CREATE INDEX "idx_scenarios_couple_id" ON "scenarios"("couple_id");

-- CreateIndex
CREATE INDEX "idx_scenarios_status" ON "scenarios"("status");

-- CreateIndex
CREATE INDEX "idx_scenarios_created_at" ON "scenarios"("created_at");

-- CreateIndex
CREATE INDEX "idx_scenarios_calculation_version" ON "scenarios"("calculation_version");

-- CreateIndex
CREATE INDEX "idx_scenario_items_scenario_id" ON "scenario_items"("scenario_id");

-- CreateIndex
CREATE INDEX "idx_scenario_items_category" ON "scenario_items"("category");

-- CreateIndex
CREATE INDEX "idx_scenario_items_sort_order" ON "scenario_items"("sort_order");

-- CreateIndex
CREATE INDEX "idx_policy_programs_status" ON "policy_programs"("status");

-- CreateIndex
CREATE INDEX "idx_policy_programs_region" ON "policy_programs"("region");

-- CreateIndex
CREATE INDEX "idx_policy_programs_category" ON "policy_programs"("category");

-- CreateIndex
CREATE INDEX "idx_policy_programs_application_end_at" ON "policy_programs"("application_end_at");

-- CreateIndex
CREATE INDEX "idx_policy_programs_verified_at" ON "policy_programs"("verified_at");

-- CreateIndex
CREATE INDEX "idx_policy_rule_versions_policy_program_id" ON "policy_rule_versions"("policy_program_id");

-- CreateIndex
CREATE INDEX "idx_policy_rule_versions_status" ON "policy_rule_versions"("status");

-- CreateIndex
CREATE INDEX "idx_policy_rule_versions_effective_range" ON "policy_rule_versions"("effective_from", "effective_to");

-- CreateIndex
CREATE INDEX "idx_policy_rule_versions_verified_at" ON "policy_rule_versions"("verified_at");

-- CreateIndex
CREATE UNIQUE INDEX "policy_rule_versions_policy_program_id_version_key" ON "policy_rule_versions"("policy_program_id", "version");

-- CreateIndex
CREATE INDEX "idx_eligibility_results_couple_id" ON "eligibility_results"("couple_id");

-- CreateIndex
CREATE INDEX "idx_eligibility_results_policy_program_id" ON "eligibility_results"("policy_program_id");

-- CreateIndex
CREATE INDEX "idx_eligibility_results_policy_rule_version_id" ON "eligibility_results"("policy_rule_version_id");

-- CreateIndex
CREATE INDEX "idx_eligibility_results_result_status" ON "eligibility_results"("result_status");

-- CreateIndex
CREATE INDEX "idx_eligibility_results_checked_at" ON "eligibility_results"("checked_at");

-- CreateIndex
CREATE INDEX "idx_vendors_category" ON "vendors"("category");

-- CreateIndex
CREATE INDEX "idx_vendors_region" ON "vendors"("region");

-- CreateIndex
CREATE INDEX "idx_vendors_status" ON "vendors"("status");

-- CreateIndex
CREATE INDEX "idx_vendors_verification_status" ON "vendors"("verification_status");

-- CreateIndex
CREATE INDEX "idx_vendors_business_identifier_hash" ON "vendors"("business_identifier_hash");

-- CreateIndex
CREATE INDEX "idx_vendor_branches_vendor_id" ON "vendor_branches"("vendor_id");

-- CreateIndex
CREATE INDEX "idx_vendor_branches_region" ON "vendor_branches"("region");

-- CreateIndex
CREATE INDEX "idx_vendor_branches_status" ON "vendor_branches"("status");

-- CreateIndex
CREATE INDEX "idx_offers_vendor_id" ON "offers"("vendor_id");

-- CreateIndex
CREATE INDEX "idx_offers_vendor_branch_id" ON "offers"("vendor_branch_id");

-- CreateIndex
CREATE INDEX "idx_offers_category" ON "offers"("category");

-- CreateIndex
CREATE INDEX "idx_offers_region" ON "offers"("region");

-- CreateIndex
CREATE INDEX "idx_offers_status" ON "offers"("status");

-- CreateIndex
CREATE INDEX "idx_offers_display_order" ON "offers"("display_order");

-- CreateIndex
CREATE INDEX "idx_offer_price_versions_offer_id" ON "offer_price_versions"("offer_id");

-- CreateIndex
CREATE INDEX "idx_offer_price_versions_verification_status" ON "offer_price_versions"("verification_status");

-- CreateIndex
CREATE INDEX "idx_offer_price_versions_valid_until" ON "offer_price_versions"("valid_until");

-- CreateIndex
CREATE INDEX "idx_offer_price_versions_verified_at" ON "offer_price_versions"("verified_at");

-- CreateIndex
CREATE UNIQUE INDEX "offer_price_versions_offer_id_version_key" ON "offer_price_versions"("offer_id", "version");

-- CreateIndex
CREATE INDEX "idx_compare_rooms_couple_id" ON "compare_rooms"("couple_id");

-- CreateIndex
CREATE INDEX "idx_compare_rooms_status" ON "compare_rooms"("status");

-- CreateIndex
CREATE INDEX "idx_compare_rooms_created_at" ON "compare_rooms"("created_at");

-- CreateIndex
CREATE INDEX "idx_compare_cards_compare_room_id" ON "compare_cards"("compare_room_id");

-- CreateIndex
CREATE INDEX "idx_compare_cards_offer_id" ON "compare_cards"("offer_id");

-- CreateIndex
CREATE INDEX "idx_compare_cards_offer_price_version_id" ON "compare_cards"("offer_price_version_id");

-- CreateIndex
CREATE INDEX "idx_compare_cards_position" ON "compare_cards"("position");

-- CreateIndex
CREATE INDEX "idx_approvals_compare_room_id" ON "approvals"("compare_room_id");

-- CreateIndex
CREATE INDEX "idx_approvals_compare_card_id" ON "approvals"("compare_card_id");

-- CreateIndex
CREATE INDEX "idx_approvals_couple_member_id" ON "approvals"("couple_member_id");

-- CreateIndex
CREATE INDEX "idx_approvals_status" ON "approvals"("status");

-- CreateIndex
CREATE INDEX "idx_compare_comments_compare_room_id" ON "compare_comments"("compare_room_id");

-- CreateIndex
CREATE INDEX "idx_compare_comments_compare_card_id" ON "compare_comments"("compare_card_id");

-- CreateIndex
CREATE INDEX "idx_compare_comments_created_at" ON "compare_comments"("created_at");

-- CreateIndex
CREATE INDEX "idx_lead_requests_couple_id" ON "lead_requests"("couple_id");

-- CreateIndex
CREATE INDEX "idx_lead_requests_compare_room_id" ON "lead_requests"("compare_room_id");

-- CreateIndex
CREATE INDEX "idx_lead_requests_vendor_id" ON "lead_requests"("vendor_id");

-- CreateIndex
CREATE INDEX "idx_lead_requests_status" ON "lead_requests"("status");

-- CreateIndex
CREATE INDEX "idx_lead_requests_submitted_at" ON "lead_requests"("submitted_at");

-- CreateIndex
CREATE INDEX "idx_lead_requests_contact_phone_hash" ON "lead_requests"("contact_phone_hash");

-- CreateIndex
CREATE INDEX "idx_lead_status_histories_lead_request_id" ON "lead_status_histories"("lead_request_id");

-- CreateIndex
CREATE INDEX "idx_lead_status_histories_to_status" ON "lead_status_histories"("to_status");

-- CreateIndex
CREATE INDEX "idx_lead_status_histories_created_at" ON "lead_status_histories"("created_at");

-- CreateIndex
CREATE INDEX "idx_decision_logs_couple_id" ON "decision_logs"("couple_id");

-- CreateIndex
CREATE INDEX "idx_decision_logs_actor_user_id" ON "decision_logs"("actor_user_id");

-- CreateIndex
CREATE INDEX "idx_decision_logs_target" ON "decision_logs"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "idx_decision_logs_action" ON "decision_logs"("action");

-- CreateIndex
CREATE INDEX "idx_decision_logs_created_at" ON "decision_logs"("created_at");

-- CreateIndex
CREATE INDEX "idx_documents_couple_id" ON "documents"("couple_id");

-- CreateIndex
CREATE INDEX "idx_documents_owner_couple_member_id" ON "documents"("owner_couple_member_id");

-- CreateIndex
CREATE INDEX "idx_documents_status" ON "documents"("status");

-- CreateIndex
CREATE INDEX "idx_documents_due_at" ON "documents"("due_at");

-- CreateIndex
CREATE INDEX "idx_documents_source" ON "documents"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "idx_tasks_couple_id" ON "tasks"("couple_id");

-- CreateIndex
CREATE INDEX "idx_tasks_assigned_couple_member_id" ON "tasks"("assigned_couple_member_id");

-- CreateIndex
CREATE INDEX "idx_tasks_status" ON "tasks"("status");

-- CreateIndex
CREATE INDEX "idx_tasks_due_at" ON "tasks"("due_at");

-- CreateIndex
CREATE INDEX "idx_tasks_source" ON "tasks"("source_type", "source_id");

-- CreateIndex
CREATE INDEX "idx_notifications_user_id" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_couple_id" ON "notifications"("couple_id");

-- CreateIndex
CREATE INDEX "idx_notifications_couple_member_id" ON "notifications"("couple_member_id");

-- CreateIndex
CREATE INDEX "idx_notifications_status" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "idx_notifications_scheduled_at" ON "notifications"("scheduled_at");

-- CreateIndex
CREATE INDEX "idx_notifications_read_at" ON "notifications"("read_at");

-- CreateIndex
CREATE UNIQUE INDEX "articles_slug_key" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "idx_articles_slug" ON "articles"("slug");

-- CreateIndex
CREATE INDEX "idx_articles_status" ON "articles"("status");

-- CreateIndex
CREATE INDEX "idx_articles_category" ON "articles"("category");

-- CreateIndex
CREATE INDEX "idx_articles_published_at" ON "articles"("published_at");

-- CreateIndex
CREATE INDEX "idx_event_logs_event_name" ON "event_logs"("event_name");

-- CreateIndex
CREATE INDEX "idx_event_logs_user_id" ON "event_logs"("user_id");

-- CreateIndex
CREATE INDEX "idx_event_logs_couple_id" ON "event_logs"("couple_id");

-- CreateIndex
CREATE INDEX "idx_event_logs_anonymous_id" ON "event_logs"("anonymous_id");

-- CreateIndex
CREATE INDEX "idx_event_logs_occurred_at" ON "event_logs"("occurred_at");

-- CreateIndex
CREATE INDEX "idx_event_logs_event_name_occurred_at" ON "event_logs"("event_name", "occurred_at");

-- AddForeignKey
ALTER TABLE "couples" ADD CONSTRAINT "couples_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_members" ADD CONSTRAINT "couple_members_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_members" ADD CONSTRAINT "couple_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_members" ADD CONSTRAINT "couple_members_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_invitations" ADD CONSTRAINT "couple_invitations_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_invitations" ADD CONSTRAINT "couple_invitations_invited_by_user_id_fkey" FOREIGN KEY ("invited_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_invitations" ADD CONSTRAINT "couple_invitations_invited_user_id_fkey" FOREIGN KEY ("invited_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "couple_invitations" ADD CONSTRAINT "couple_invitations_accepted_by_user_id_fkey" FOREIGN KEY ("accepted_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_items" ADD CONSTRAINT "scenario_items_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "scenarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_programs" ADD CONSTRAINT "policy_programs_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_rule_versions" ADD CONSTRAINT "policy_rule_versions_policy_program_id_fkey" FOREIGN KEY ("policy_program_id") REFERENCES "policy_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "policy_rule_versions" ADD CONSTRAINT "policy_rule_versions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eligibility_results" ADD CONSTRAINT "eligibility_results_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eligibility_results" ADD CONSTRAINT "eligibility_results_policy_program_id_fkey" FOREIGN KEY ("policy_program_id") REFERENCES "policy_programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eligibility_results" ADD CONSTRAINT "eligibility_results_policy_rule_version_id_fkey" FOREIGN KEY ("policy_rule_version_id") REFERENCES "policy_rule_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_branches" ADD CONSTRAINT "vendor_branches_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_vendor_branch_id_fkey" FOREIGN KEY ("vendor_branch_id") REFERENCES "vendor_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_price_versions" ADD CONSTRAINT "offer_price_versions_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_price_versions" ADD CONSTRAINT "offer_price_versions_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_rooms" ADD CONSTRAINT "compare_rooms_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_rooms" ADD CONSTRAINT "compare_rooms_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_cards" ADD CONSTRAINT "compare_cards_compare_room_id_fkey" FOREIGN KEY ("compare_room_id") REFERENCES "compare_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_cards" ADD CONSTRAINT "compare_cards_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_cards" ADD CONSTRAINT "compare_cards_offer_price_version_id_fkey" FOREIGN KEY ("offer_price_version_id") REFERENCES "offer_price_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_cards" ADD CONSTRAINT "compare_cards_added_by_user_id_fkey" FOREIGN KEY ("added_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_compare_room_id_fkey" FOREIGN KEY ("compare_room_id") REFERENCES "compare_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_compare_card_id_fkey" FOREIGN KEY ("compare_card_id") REFERENCES "compare_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_couple_member_id_fkey" FOREIGN KEY ("couple_member_id") REFERENCES "couple_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_comments" ADD CONSTRAINT "compare_comments_compare_room_id_fkey" FOREIGN KEY ("compare_room_id") REFERENCES "compare_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_comments" ADD CONSTRAINT "compare_comments_compare_card_id_fkey" FOREIGN KEY ("compare_card_id") REFERENCES "compare_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_comments" ADD CONSTRAINT "compare_comments_couple_member_id_fkey" FOREIGN KEY ("couple_member_id") REFERENCES "couple_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compare_comments" ADD CONSTRAINT "compare_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_requests" ADD CONSTRAINT "lead_requests_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_requests" ADD CONSTRAINT "lead_requests_compare_room_id_fkey" FOREIGN KEY ("compare_room_id") REFERENCES "compare_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_requests" ADD CONSTRAINT "lead_requests_compare_card_id_fkey" FOREIGN KEY ("compare_card_id") REFERENCES "compare_cards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_requests" ADD CONSTRAINT "lead_requests_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_requests" ADD CONSTRAINT "lead_requests_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_requests" ADD CONSTRAINT "lead_requests_offer_price_version_id_fkey" FOREIGN KEY ("offer_price_version_id") REFERENCES "offer_price_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_requests" ADD CONSTRAINT "lead_requests_submitted_by_user_id_fkey" FOREIGN KEY ("submitted_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_status_histories" ADD CONSTRAINT "lead_status_histories_lead_request_id_fkey" FOREIGN KEY ("lead_request_id") REFERENCES "lead_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_status_histories" ADD CONSTRAINT "lead_status_histories_changed_by_user_id_fkey" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decision_logs" ADD CONSTRAINT "decision_logs_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decision_logs" ADD CONSTRAINT "decision_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decision_logs" ADD CONSTRAINT "decision_logs_actor_couple_member_id_fkey" FOREIGN KEY ("actor_couple_member_id") REFERENCES "couple_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_owner_couple_member_id_fkey" FOREIGN KEY ("owner_couple_member_id") REFERENCES "couple_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_couple_member_id_fkey" FOREIGN KEY ("assigned_couple_member_id") REFERENCES "couple_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_couple_member_id_fkey" FOREIGN KEY ("couple_member_id") REFERENCES "couple_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_logs" ADD CONSTRAINT "event_logs_couple_id_fkey" FOREIGN KEY ("couple_id") REFERENCES "couples"("id") ON DELETE SET NULL ON UPDATE CASCADE;
