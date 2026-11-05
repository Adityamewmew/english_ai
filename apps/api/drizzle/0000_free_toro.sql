CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(100) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"password" varchar(255),
	"role" varchar(20) DEFAULT 'student' NOT NULL,
	"access_type" integer DEFAULT 2 NOT NULL,
	"current_cefr" varchar(10) DEFAULT 'A1' NOT NULL,
	"avatar_url" varchar(255),
	"memory" jsonb DEFAULT '{"facts":[],"interests":[],"weaknesses":[],"totalCalls":0}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	"deleted_by" varchar(36),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "curriculum_levels" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"cefr" varchar(10) NOT NULL,
	"title" varchar(150) NOT NULL,
	"description" text,
	"order_index" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "curriculum_modules" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"level_id" varchar(20) DEFAULT 'A1.1' NOT NULL,
	"title" varchar(150) NOT NULL,
	"cefr" varchar(10) NOT NULL,
	"group" varchar(100) NOT NULL,
	"objective" text NOT NULL,
	"complexity" varchar(20) DEFAULT 'medium' NOT NULL,
	"estimated_minutes" integer DEFAULT 15 NOT NULL,
	"is_exam" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"passing_score" integer DEFAULT 70 NOT NULL,
	"order_index" integer DEFAULT 1 NOT NULL,
	"banner_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "module_sections" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"module_id" varchar(20) NOT NULL,
	"sub_module_id" varchar(36),
	"section_type" varchar(30) NOT NULL,
	"title" varchar(150) NOT NULL,
	"content" jsonb NOT NULL,
	"order_index" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_modules" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"module_id" varchar(20) NOT NULL,
	"skill_type" varchar(20) NOT NULL,
	"title" varchar(150) NOT NULL,
	"order_index" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_module_progress" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"module_id" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'locked' NOT NULL,
	"score" integer,
	"step_progress" jsonb,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sub_module_progress" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"sub_module_id" varchar(36) NOT NULL,
	"status" varchar(20) DEFAULT 'locked' NOT NULL,
	"score" integer,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_bank" (
	"id" varchar(50) PRIMARY KEY NOT NULL,
	"skill" varchar(20) NOT NULL,
	"cefr" varchar(10) NOT NULL,
	"type" varchar(20) DEFAULT 'MCQ' NOT NULL,
	"question" text NOT NULL,
	"options" jsonb,
	"answer" text NOT NULL,
	"audio_script" text,
	"audio_url" varchar(255),
	"explanation" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "placement_results" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"overall_cefr" varchar(10) NOT NULL,
	"mcq_score" integer NOT NULL,
	"writing_score" integer,
	"speaking_score" integer,
	"score_percent" integer NOT NULL,
	"details" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "call_sessions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"module_id" varchar(10),
	"topic" varchar(150) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"transcript" text,
	"stt_provider" varchar(30) DEFAULT 'web-speech',
	"evaluation" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"session_id" varchar(36) NOT NULL,
	"client_message_id" varchar(64),
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"title" varchar(200) DEFAULT 'Percakapan Baru' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "certificate_templates" (
	"cefr" varchar(20) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"instructor_name" varchar(150),
	"instructor_title" varchar(150),
	"signature_url" text,
	"background_url" text,
	"theme_color" varchar(50),
	"name_x_percent" integer DEFAULT 50,
	"name_y_percent" integer DEFAULT 34,
	"name_font_size" integer DEFAULT 26,
	"scores_x_percent" integer DEFAULT 50,
	"scores_y_percent" integer DEFAULT 52,
	"scores_font_size" integer DEFAULT 10,
	"date_x_percent" integer DEFAULT 18,
	"date_y_percent" integer DEFAULT 80,
	"date_font_size" integer DEFAULT 8,
	"place_x_percent" integer DEFAULT 50,
	"place_y_percent" integer DEFAULT 80,
	"place_font_size" integer DEFAULT 8,
	"ref_no_x_percent" integer DEFAULT 82,
	"ref_no_y_percent" integer DEFAULT 80,
	"ref_no_font_size" integer DEFAULT 8,
	"orientation" varchar(20) DEFAULT 'portrait',
	"place_of_entry" varchar(255) DEFAULT 'PBN Kelapa Gading, D.18 Jember East Java',
	"layout_config" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_certificates" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"certificate_number" varchar(100) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"cefr_level" varchar(20) NOT NULL,
	"user_name" varchar(150) NOT NULL,
	"score" integer DEFAULT 85 NOT NULL,
	"scores_breakdown" jsonb,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	"issued_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_certificates_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
CREATE TABLE "course_classes" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"cefr" varchar(10) NOT NULL,
	"name" varchar(150) NOT NULL,
	"description" text,
	"price" integer DEFAULT 0 NOT NULL,
	"original_price" integer,
	"features" jsonb,
	"tier_plans" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"order_index" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_classes_cefr_unique" UNIQUE("cefr")
);
--> statement-breakpoint
CREATE TABLE "user_class_access" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"cefr" varchar(10) NOT NULL,
	"tier" varchar(20) DEFAULT 'basic' NOT NULL,
	"granted_by" varchar(50) DEFAULT 'admin' NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_daily_ai_usage" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"usage_date" varchar(10) NOT NULL,
	"chat_count" integer DEFAULT 0 NOT NULL,
	"voice_seconds" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_methods" (
	"id" serial PRIMARY KEY NOT NULL,
	"bank_name" varchar(100) NOT NULL,
	"account_name" varchar(150) NOT NULL,
	"account_number" varchar(50) NOT NULL,
	"bank_logo" text,
	"instructions" text,
	"is_active" smallint DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 1 NOT NULL,
	"created_by" varchar(36),
	"updated_by" varchar(36),
	"deleted_by" varchar(36),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "payment_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "payment_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"order_id" varchar(50) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"cefr" varchar(10) NOT NULL,
	"tier" varchar(20) DEFAULT 'basic' NOT NULL,
	"payment_category" varchar(30) NOT NULL,
	"payment_channel" varchar(50) NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"va_number" varchar(50),
	"qr_data" text,
	"qr_image_url" text,
	"transfer_proof_url" text,
	"rejection_reason" text,
	"expires_at" timestamp NOT NULL,
	"paid_at" timestamp,
	"approved_by" varchar(36),
	"approved_at" timestamp,
	"singapay_payload" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "payment_transactions_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "user_bank_accounts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"bank_code" varchar(20) NOT NULL,
	"bank_swift_code" varchar(20),
	"bank_name" varchar(100) NOT NULL,
	"account_number" varchar(50) NOT NULL,
	"account_name" varchar(150) NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_by" varchar(255),
	"updated_by" varchar(255),
	"deleted_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"payable_type" varchar(255) NOT NULL,
	"payable_id" varchar(255) NOT NULL,
	"wallet_id" bigserial NOT NULL,
	"type" varchar(20) NOT NULL,
	"amount" numeric(64, 0) NOT NULL,
	"confirmed" boolean DEFAULT true NOT NULL,
	"meta" jsonb,
	"uuid" varchar(36) NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "transactions_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "transfers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"from_id" bigserial NOT NULL,
	"to_id" bigserial NOT NULL,
	"status" varchar(20) DEFAULT 'transfer' NOT NULL,
	"status_last" varchar(20),
	"deposit_id" bigserial NOT NULL,
	"withdraw_id" bigserial NOT NULL,
	"discount" numeric(64, 0) DEFAULT '0' NOT NULL,
	"fee" numeric(64, 0) DEFAULT '0' NOT NULL,
	"uuid" varchar(36) NOT NULL,
	"extra" jsonb,
	"created_at" timestamp,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "transfers_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "wallets" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"holder_type" varchar(255) NOT NULL,
	"holder_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"uuid" varchar(36) NOT NULL,
	"description" varchar(255),
	"meta" jsonb,
	"balance" numeric(64, 0) DEFAULT '0' NOT NULL,
	"decimal_places" smallint DEFAULT 2 NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp,
	"deleted_at" timestamp,
	CONSTRAINT "wallets_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"bank_account_id" varchar(36) NOT NULL,
	"reference_no" varchar(100) NOT NULL,
	"singapay_trx_id" varchar(100),
	"amount" numeric(15, 2) NOT NULL,
	"admin_fee" numeric(15, 2) DEFAULT '2500' NOT NULL,
	"total_debit" numeric(15, 2) NOT NULL,
	"singapay_cost" numeric(15, 2) DEFAULT '1200' NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"notes" text,
	"failure_reason" text,
	"approved_by" varchar(255),
	"approved_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "withdrawals_reference_no_unique" UNIQUE("reference_no")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_users_access_cefr" ON "users" USING btree ("access_type","current_cefr");--> statement-breakpoint
CREATE INDEX "idx_users_created_at" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_curriculum_modules_cefr_level" ON "curriculum_modules" USING btree ("cefr","level_id","order_index");--> statement-breakpoint
CREATE INDEX "idx_module_sections_module_id" ON "module_sections" USING btree ("module_id","order_index");--> statement-breakpoint
CREATE INDEX "idx_module_sections_sub_module_id" ON "module_sections" USING btree ("sub_module_id");--> statement-breakpoint
CREATE INDEX "idx_sub_modules_module_id" ON "sub_modules" USING btree ("module_id","order_index");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_user_module_progress_user_mod" ON "user_module_progress" USING btree ("user_id","module_id");--> statement-breakpoint
CREATE INDEX "idx_user_module_progress_user_status" ON "user_module_progress" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_user_mod_prog_status_score" ON "user_module_progress" USING btree ("status","score");--> statement-breakpoint
CREATE UNIQUE INDEX "user_sub_module_idx" ON "user_sub_module_progress" USING btree ("user_id","sub_module_id");--> statement-breakpoint
CREATE INDEX "idx_user_sub_mod_prog_user_status" ON "user_sub_module_progress" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "idx_item_bank_skill_cefr" ON "item_bank" USING btree ("skill","cefr");--> statement-breakpoint
CREATE INDEX "idx_placement_results_user_created" ON "placement_results" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_call_sessions_user_created" ON "call_sessions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_chat_messages_session_created" ON "chat_messages" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_chat_sessions_user_created" ON "chat_sessions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_class_access_user_cefr_idx" ON "user_class_access" USING btree ("user_id","cefr");--> statement-breakpoint
CREATE UNIQUE INDEX "user_daily_ai_usage_user_date_idx" ON "user_daily_ai_usage" USING btree ("user_id","usage_date");--> statement-breakpoint
CREATE INDEX "idx_payment_tx_created_status" ON "payment_transactions" USING btree ("created_at","status");--> statement-breakpoint
CREATE INDEX "idx_payment_tx_user_id" ON "payment_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_bank_accounts_user_primary_idx" ON "user_bank_accounts" USING btree ("user_id","is_primary");--> statement-breakpoint
CREATE INDEX "payable_type_payable_id_ind" ON "transactions" USING btree ("payable_type","payable_id");--> statement-breakpoint
CREATE INDEX "payable_type_ind" ON "transactions" USING btree ("payable_type","payable_id","type");--> statement-breakpoint
CREATE INDEX "payable_confirmed_ind" ON "transactions" USING btree ("payable_type","payable_id","confirmed");--> statement-breakpoint
CREATE INDEX "transactions_wallet_id_idx" ON "transactions" USING btree ("wallet_id");--> statement-breakpoint
CREATE INDEX "transactions_type_idx" ON "transactions" USING btree ("type");--> statement-breakpoint
CREATE INDEX "transfers_from_id_idx" ON "transfers" USING btree ("from_id");--> statement-breakpoint
CREATE INDEX "transfers_to_id_idx" ON "transfers" USING btree ("to_id");--> statement-breakpoint
CREATE UNIQUE INDEX "wallets_holder_slug_unique" ON "wallets" USING btree ("holder_type","holder_id","slug");--> statement-breakpoint
CREATE INDEX "wallets_holder_idx" ON "wallets" USING btree ("holder_type","holder_id");--> statement-breakpoint
CREATE INDEX "wallets_slug_idx" ON "wallets" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "withdrawals_user_status_idx" ON "withdrawals" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "withdrawals_reference_no_idx" ON "withdrawals" USING btree ("reference_no");