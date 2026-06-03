DO $$ BEGIN
  CREATE TYPE "tipo_categoria" AS ENUM ('RECEITA', 'DESPESA');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "tipo_transacao" AS ENUM ('RECEITA', 'DESPESA');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "categorias" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nome" text NOT NULL,
  "tipo" "tipo_categoria" NOT NULL,
  "atletica_id" uuid NOT NULL,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS "transacoes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "descricao" text NOT NULL,
  "valor" numeric(12, 2) NOT NULL,
  "tipo" "tipo_transacao" NOT NULL,
  "categoria_id" uuid NOT NULL REFERENCES "categorias"("id") ON DELETE RESTRICT,
  "atletica_id" uuid NOT NULL,
  "data_transacao" timestamp with time zone NOT NULL,
  "observacao" text,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);
