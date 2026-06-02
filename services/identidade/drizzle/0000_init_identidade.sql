DO $$ BEGIN
  CREATE TYPE "usuario_role" AS ENUM ('ADMINISTRADOR', 'MEMBRO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "usuario_status" AS ENUM ('ATIVO', 'INATIVO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "usuarios" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nome" text NOT NULL,
  "email" text NOT NULL,
  "senha_hash" varchar(255) NOT NULL,
  "role" "usuario_role" NOT NULL DEFAULT 'MEMBRO',
  "status" "usuario_status" NOT NULL DEFAULT 'ATIVO',
  "atletica_id" uuid NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "refresh_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "token" text NOT NULL,
  "usuario_id" uuid NOT NULL REFERENCES "usuarios"("id") ON DELETE CASCADE,
  "expires_at" timestamp with time zone NOT NULL,
  "revogado" boolean NOT NULL DEFAULT false,
  "created_at" timestamp with time zone NOT NULL,
  CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
