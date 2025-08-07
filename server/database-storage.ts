import { db } from './db';
import { liveLectures, recordedLectures, type LiveLecture, type InsertLiveLecture, type RecordedLecture, type InsertRecordedLecture } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

export class DatabaseStorage {
  // Live Lectures
  async createLiveLecture(data: InsertLiveLecture): Promise<LiveLecture> {
    try {
      const [lecture] = await db.insert(liveLectures).values({
        ...data,
        isLive: true,
        viewers: 0,
      }).returning();
      return lecture;
    } catch (error) {
      console.error('Error creating live lecture:', error);
      throw new Error('Failed to create live lecture');
    }
  }

  async getLiveLectures(): Promise<LiveLecture[]> {
    try {
      return await db.select().from(liveLectures).orderBy(liveLectures.createdAt);
    } catch (error) {
      console.error('Error fetching live lectures:', error);
      return [];
    }
  }

  async updateLiveLecture(id: number, updates: Partial<LiveLecture>): Promise<LiveLecture | undefined> {
    try {
      const [updated] = await db.update(liveLectures)
        .set(updates)
        .where(eq(liveLectures.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error('Error updating live lecture:', error);
      return undefined;
    }
  }

  async deleteLiveLecture(id: number): Promise<boolean> {
    try {
      const result = await db.delete(liveLectures).where(eq(liveLectures.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting live lecture:', error);
      return false;
    }
  }

  // Recorded Lectures
  async createRecordedLecture(data: InsertRecordedLecture): Promise<RecordedLecture> {
    try {
      const [lecture] = await db.insert(recordedLectures).values({
        ...data,
        views: 0,
        isBookmarked: false,
      }).returning();
      return lecture;
    } catch (error) {
      console.error('Error creating recorded lecture:', error);
      throw new Error('Failed to create recorded lecture');
    }
  }

  async getRecordedLectures(subject?: string): Promise<RecordedLecture[]> {
    try {
      if (subject) {
        return await db.select().from(recordedLectures)
          .where(eq(recordedLectures.subject, subject))
          .orderBy(desc(recordedLectures.uploadDate));
      }
      return await db.select().from(recordedLectures).orderBy(desc(recordedLectures.uploadDate));
    } catch (error) {
      console.error('Error fetching recorded lectures:', error);
      return [];
    }
  }

  async getRecordedLecturesBySubject(subject: string): Promise<RecordedLecture[]> {
    try {
      return await db.select().from(recordedLectures)
        .where(eq(recordedLectures.subject, subject))
        .orderBy(desc(recordedLectures.uploadDate));
    } catch (error) {
      console.error('Error fetching lectures by subject:', error);
      return [];
    }
  }

  async updateRecordedLecture(id: number, updates: Partial<RecordedLecture>): Promise<RecordedLecture | undefined> {
    try {
      const [updated] = await db.update(recordedLectures)
        .set(updates)
        .where(eq(recordedLectures.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error('Error updating recorded lecture:', error);
      return undefined;
    }
  }

  async toggleBookmark(id: number): Promise<RecordedLecture | undefined> {
    try {
      const [current] = await db.select().from(recordedLectures).where(eq(recordedLectures.id, id));
      if (!current) return undefined;

      const [updated] = await db.update(recordedLectures)
        .set({ isBookmarked: !current.isBookmarked })
        .where(eq(recordedLectures.id, id))
        .returning();
      return updated;
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      return undefined;
    }
  }

  async deleteRecordedLecture(id: number): Promise<boolean> {
    try {
      await db.delete(recordedLectures).where(eq(recordedLectures.id, id));
      return true;
    } catch (error) {
      console.error('Error deleting recorded lecture:', error);
      return false;
    }
  }
}

export const databaseStorage = new DatabaseStorage();