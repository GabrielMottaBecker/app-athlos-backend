DO $$ BEGIN
  CREATE TYPE "status_produto" AS ENUM ('DISPONIVEL', 'ESGOTADO', 'INATIVO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "produtos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "nome" text NOT NULL,
  "descricao" text NOT NULL,
  "preco" numeric(10, 2) NOT NULL,
  "estoque" integer NOT NULL DEFAULT 0,
  "status" "status_produto" NOT NULL DEFAULT 'DISPONIVEL',
  "atletica_id" uuid NOT NULL,
  "imagem_url" text,
  "created_at" timestamp with time zone NOT NULL,
  "updated_at" timestamp with time zone NOT NULL
);
