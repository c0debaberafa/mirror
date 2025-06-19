CREATE TABLE "call_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"call_id" text NOT NULL,
	"user_id" uuid,
	"clerk_user_id" text,
	"summary" text,
	"transcript" text,
	"messages" jsonb,
	"ended_reason" text,
	"recording_url" text,
	"assistant_id" text,
	"call_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "call_summaries_call_id_unique" UNIQUE("call_id")
);
--> statement-breakpoint
ALTER TABLE "call_summaries" ADD CONSTRAINT "call_summaries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;