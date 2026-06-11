CREATE TABLE IF NOT EXISTS atleticas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome        VARCHAR(255) NOT NULL,
  nome_presidente VARCHAR(255) NOT NULL,
  cor_primaria    VARCHAR(7),
  cor_fundo       VARCHAR(7),
  criado_em   TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);