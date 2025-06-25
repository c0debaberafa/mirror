CREATE TABLE "waitlist" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"response" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
