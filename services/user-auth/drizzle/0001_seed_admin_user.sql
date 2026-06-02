INSERT INTO "users" (
  "email",
  "password",
  "permissions",
  "created_at",
  "updated_at"
)
VALUES (
  'admin@school.com',
  '$2a$10$q0t0DiviwiX4dxXQumC8V.jQ8.e1i.0wirNfR/n7fu8GPbXjLpw92',
  ARRAY[
    'associados:read',
    'associados:write',
    'associados:delete',
    'users:read',
    'users:write',
    'users:delete'
  ]::text[],
  NOW(),
  NOW()
)
ON CONFLICT ("email") DO UPDATE
SET
  "password" = EXCLUDED."password",
  "permissions" = EXCLUDED."permissions",
  "updated_at" = NOW();