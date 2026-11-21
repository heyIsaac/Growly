CREATE TYPE "public"."payment_method" AS ENUM('CARD', 'PIX');--> statement-breakpoint
CREATE TYPE "public"."subscription_plan" AS ENUM('ESSENTIAL', 'GROWTH', 'SCALE');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('ACTIVE', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"order_code" text NOT NULL,
	"plan" "subscription_plan" NOT NULL,
	"seats" integer NOT NULL,
	"monthly_cents" integer NOT NULL,
	"payment_method" "payment_method" NOT NULL,
	"card_last4" text,
	"status" "subscription_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscriptions_order_code_unique" UNIQUE("order_code")
);
--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "subscriptions_company_id_idx" ON "subscriptions" USING btree ("company_id");