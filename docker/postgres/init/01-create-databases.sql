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

SELECT 'CREATE DATABASE athlos_financeiro'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'athlos_financeiro'
)\gexec

SELECT 'CREATE DATABASE athlos_lojinha'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'athlos_lojinha'
)\gexec
