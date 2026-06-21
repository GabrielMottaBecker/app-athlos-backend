ALTER TABLE "usuarios" ALTER COLUMN "senha_hash" DROP NOT NULL;

ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "telefone" varchar(20);
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "associado_id" uuid;
ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "ativado_em" timestamp with time zone;

ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_associado_id_unique" UNIQUE("associado_id");