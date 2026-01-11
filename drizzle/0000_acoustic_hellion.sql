CREATE TABLE "medicines" (
	"id" text PRIMARY KEY NOT NULL,
	"prescription_id" text NOT NULL,
	"medicine" text NOT NULL,
	"dosage" text NOT NULL,
	"dosage_persian" text,
	"form" text,
	"form_persian" text,
	"frequency" text,
	"frequency_persian" text,
	"duration" text,
	"duration_persian" text,
	"route" text,
	"timing" text,
	"with_food" boolean DEFAULT false,
	"instructions" text,
	"instructions_persian" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"patient_name" text NOT NULL,
	"patient_age" text,
	"patient_gender" text,
	"patient_phone" text,
	"patient_address" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
