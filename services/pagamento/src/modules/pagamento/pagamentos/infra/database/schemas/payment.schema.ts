import { pgTable, uuid, varchar, doublePrecision, timestamp } from 'drizzle-orm/pg-core';

export const paymentsSchema = pgTable('payments', {
  id:          uuid('id').primaryKey().defaultRandom(),
  type:        varchar('type', { length: 50 }).notNull(),
  status:      varchar('status', { length: 50 }).notNull(),
  amount:      doublePrecision('amount').notNull(),
  referenceId: varchar('reference_id', { length: 255 }).notNull(),
  pixCode:     varchar('pix_code', { length: 500 }).notNull(),
  createdAt:   timestamp('created_at').defaultNow(),
  updatedAt:   timestamp('updated_at').defaultNow(),
});