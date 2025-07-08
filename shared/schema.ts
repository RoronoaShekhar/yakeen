import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const liveLectures = pgTable("live_lectures", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  lectureUrl: text("lecture_url").notNull(),
  subject: text("subject").notNull(),
  isLive: boolean("is_live").default(false),
  viewers: integer("viewers").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recordedLectures = pgTable("recorded_lectures", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subject: text("subject").notNull(),
  youtubeUrl: text("youtube_url").notNull(),
  views: integer("views").default(0),
  uploadDate: timestamp("upload_date").defaultNow(),
  isBookmarked: boolean("is_bookmarked").default(false),
});

export const insertLiveLectureSchema = createInsertSchema(liveLectures, {
  lectureUrl: z.string().regex(/^https:\/\/live-server\.dev-boi\.xyz/, "Please provide a valid live-server.dev-boi.xyz URL"),
  subject: z.enum(["physics", "chemistry", "botany", "zoology"]),
}).omit({
  id: true,
  createdAt: true,
  viewers: true,
  isLive: true,
});

export const insertRecordedLectureSchema = createInsertSchema(recordedLectures, {
  youtubeUrl: z.string().regex(/^https:\/\/youtu\.be\/[a-zA-Z0-9_-]+$/, "Please provide a valid youtu.be URL"),
  subject: z.enum(["physics", "chemistry", "botany", "zoology"]),
}).omit({
  id: true,
  uploadDate: true,
  views: true,
  isBookmarked: true,
});

export type LiveLecture = typeof liveLectures.$inferSelect;
export type InsertLiveLecture = z.infer<typeof insertLiveLectureSchema>;
export type RecordedLecture = typeof recordedLectures.$inferSelect;
export type InsertRecordedLecture = z.infer<typeof insertRecordedLectureSchema>;
