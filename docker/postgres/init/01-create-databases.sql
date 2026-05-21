SELECT 'CREATE DATABASE athlos_associacao'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'athlos_associacao'
)\gexec
