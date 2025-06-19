CREATE TABLE "essay_tidbits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"essay_id" uuid NOT NULL,
	"tidbit_id" uuid NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "living_essays" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"sections" jsonb NOT NULL,
	"previous_version_id" uuid,
	"delta" jsonb
);
--> statement-breakpoint
CREATE TABLE "tidbits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp DEFAULT now() NOT NULL,
	"relevance_score" double precision NOT NULL
);
--> statement-breakpoint
ALTER TABLE "essay_tidbits" ADD CONSTRAINT "essay_tidbits_essay_id_living_essays_id_fk" FOREIGN KEY ("essay_id") REFERENCES "public"."living_essays"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "essay_tidbits" ADD CONSTRAINT "essay_tidbits_tidbit_id_tidbits_id_fk" FOREIGN KEY ("tidbit_id") REFERENCES "public"."tidbits"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "living_essays" ADD CONSTRAINT "living_essays_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "living_essays" ADD CONSTRAINT "living_essays_previous_version_id_living_essays_id_fk" FOREIGN KEY ("previous_version_id") REFERENCES "public"."living_essays"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tidbits" ADD CONSTRAINT "tidbits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;