DO $$ BEGIN
  CREATE TYPE "notificacao_tipo" AS ENUM ('EVENTO_PUBLICADO', 'ASSOCIACAO_ATUALIZADA', 'SISTEMA');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "device_platform" AS ENUM ('ANDROID', 'IOS', 'WEB');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "notificacoes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "usuario_id" uuid,
  "atletica_id" uuid NOT NULL,
  "tipo" "notificacao_tipo" NOT NULL,
  "titulo" text NOT NULL,
  "mensagem" text NOT NULL,
  "metadata" jsonb,
  "created_at" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS "notificacao_leituras" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "notificacao_id" uuid NOT NULL REFERENCES "notificacoes"("id") ON DELETE CASCADE,
  "usuario_id" uuid NOT NULL,
  "read_at" timestamp with time zone NOT NULL,
  CONSTRAINT "notificacao_leituras_notificacao_id_usuario_id_unique" UNIQUE("notificacao_id", "usuario_id")
);

CREATE TABLE IF NOT EXISTS "device_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "usuario_id" uuid NOT NULL,
  "atletica_id" uuid NOT NULL,
  "token" text NOT NULL,
  "platform" "device_platform" NOT NULL,
  "ativo" boolean NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL,
  CONSTRAINT "device_tokens_token_unique" UNIQUE("token")
);
