DO $$ BEGIN
  CREATE TYPE "tipo_cargo" AS ENUM ('ADMINISTRADOR', 'MEMBRO_COMUM');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "cargos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nome" text NOT NULL,
  "tipo" "tipo_cargo" NOT NULL,
  "atletica_id" uuid NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);

ALTER TABLE "associados"
  ADD COLUMN IF NOT EXISTS "cargo_id" uuid REFERENCES "cargos"("id") ON DELETE SET NULL;
