import { pgTable, uuid, varchar, doublePrecision, timestamp } from 'drizzle-orm/pg-core';

export const productsSchema = pgTable('products', {
  id:        uuid('id').primaryKey().defaultRandom(),
  name:      varchar('name', { length: 255 }).notNull(),
  price:     doublePrecision('price').notNull(),
  category:  varchar('category', { length: 100 }).notNull(),
  imageUrl:  varchar('image_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});