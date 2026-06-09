DO $$ BEGIN
  CREATE TYPE "tipo_evento" AS ENUM ('TREINO', 'EVENTO SOCIAL', 'EXTRAS', 'COMPETICAO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "status_presenca_evento" AS ENUM ('CONFIRMADA');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "eventos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "date" text NOT NULL,
  "type" "tipo_evento" NOT NULL,
  "type_color" bigint NOT NULL,
  "title" text NOT NULL,
  "time" text NOT NULL,
  "place" text NOT NULL,
  "bg_color" bigint NOT NULL,
  "atletica_id" uuid NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS "evento_presencas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "evento_id" uuid NOT NULL REFERENCES "eventos"("id") ON DELETE CASCADE,
  "usuario_id" uuid NOT NULL,
  "status" "status_presenca_evento" NOT NULL DEFAULT 'CONFIRMADA',
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "evento_presencas_evento_id_usuario_id_unique" UNIQUE("evento_id", "usuario_id")
);
