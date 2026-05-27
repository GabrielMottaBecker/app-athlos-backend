SELECT 'CREATE DATABASE athlos_user_auth'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'athlos_user_auth'
)\gexec

SELECT 'CREATE DATABASE athlos_associacao'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'athlos_associacao'
)\gexec