import {
  pgTable,
  uuid,
  text,
  integer,
  date,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';

// 听书记录表
export const audiobookRecord = pgTable('audiobook_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  currentEpisode: integer('current_episode').notNull().default(0),
  totalEpisodes: integer('total_episodes').notNull().default(0),
  durationMinutes: integer('duration_minutes').notNull().default(0),
  recordDate: date('record_date').notNull(),
  rating: integer('rating').notNull().default(0),
  status: varchar('status', { length: 20 }).notNull().default('listening'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// 推荐表
export const recommendation = pgTable('recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  platform: varchar('platform', { length: 20 }).notNull(),
  category: varchar('category', { length: 20 }).notNull(),
  voiceActors: text('voice_actors'),
  originalWork: text('original_work'),
  synopsis: text('synopsis'),
  coverUrl: text('cover_url'),
  sourceType: varchar('source_type', { length: 10 }).notNull().default('seed'),
  externalId: varchar('external_id', { length: 100 }),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export type AudiobookRecord = typeof audiobookRecord.$inferSelect;
export type AudiobookRecordInsert = typeof audiobookRecord.$inferInsert;
export type Recommendation = typeof recommendation.$inferSelect;
export type RecommendationInsert = typeof recommendation.$inferInsert;
