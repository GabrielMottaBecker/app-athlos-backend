DO $$ BEGIN
  CREATE TYPE "status_associado" AS ENUM ('ATIVO', 'INATIVO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "associados" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nome" text NOT NULL,
  "email" text NOT NULL,
  "documento" varchar(20) NOT NULL,
  "telefone" varchar(20) NOT NULL,
  "status" "status_associado" NOT NULL DEFAULT 'ATIVO',
  "atletica_id" uuid NOT NULL,
  "taxa_athlos" numeric(10, 2) NOT NULL DEFAULT '0',
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "associados_email_unique" UNIQUE("email"),
  CONSTRAINT "associados_documento_unique" UNIQUE("documento")
);
