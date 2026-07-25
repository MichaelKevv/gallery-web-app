import { pgTable, serial, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const images = pgTable('images', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  size: integer('size').notNull(),
  isShared: boolean('is_shared').default(false).notNull(),
  isFavorite: boolean('is_favorite').default(false).notNull(),
  isTrashed: boolean('is_trashed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
