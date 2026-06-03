SELECT 'CREATE DATABASE athlos_user_auth'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'athlos_user_auth'
)\gexec

SELECT 'CREATE DATABASE athlos_associacao'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'athlos_associacao'
)\gexec

SELECT 'CREATE DATABASE athlos_identidade'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'athlos_identidade'
)\gexec

SELECT 'CREATE DATABASE athlos_feed'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'athlos_feed'
)\gexec

SELECT 'CREATE DATABASE athlos_notificacoes'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'athlos_notificacoes'
)\gexec
