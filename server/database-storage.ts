
import { db } from './db';
import { liveLectures, recordedLectures } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import { LiveLecture, RecordedLecture, InsertLiveLecture, InsertRecordedLecture } from '@shared/schema';
import { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  // Live Lectures
  async createLiveLecture(insertLecture: InsertLiveLecture): Promise<LiveLecture> {
    const [lecture] = await db.insert(liveLectures).values({
      ...insertLecture,
      isLive: true,
      viewers: 0,
    }).returning();
    return lecture;
  }

  async getLiveLectures(): Promise<LiveLecture[]> {
    return await db.select().from(liveLectures).orderBy(desc(liveLectures.createdAt));
  }

  async updateLiveLecture(id: number, updates: Partial<LiveLecture>): Promise<LiveLecture | undefined> {
    const [updated] = await db.update(liveLectures)
      .set(updates)
      .where(eq(liveLectures.id, id))
      .returning();
    return updated;
  }

  async deleteLiveLecture(id: number): Promise<boolean> {
    const result = await db.delete(liveLectures).where(eq(liveLectures.id, id));
    return result.rowCount > 0;
  }

  async deleteExpiredLiveLectures(): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await db.delete(liveLectures)
      .where(eq(liveLectures.createdAt, oneDayAgo));
    return result.rowCount;
  }

  // Recorded Lectures
  async createRecordedLecture(insertLecture: InsertRecordedLecture): Promise<RecordedLecture> {
    const [lecture] = await db.insert(recordedLectures).values({
      ...insertLecture,
      views: 0,
      isBookmarked: false,
    }).returning();
    return lecture;
  }

  async getRecordedLectures(subject?: string): Promise<RecordedLecture[]> {
    let query = db.select().from(recordedLectures);
    
    if (subject) {
      query = query.where(eq(recordedLectures.subject, subject));
    }
    
    return await query.orderBy(desc(recordedLectures.uploadDate));
  }

  async getRecordedLecturesBySubject(subject: string): Promise<RecordedLecture[]> {
    return this.getRecordedLectures(subject);
  }

  async updateRecordedLecture(id: number, updates: Partial<RecordedLecture>): Promise<RecordedLecture | undefined> {
    const [updated] = await db.update(recordedLectures)
      .set(updates)
      .where(eq(recordedLectures.id, id))
      .returning();
    return updated;
  }

  async deleteRecordedLecture(id: number): Promise<boolean> {
    const result = await db.delete(recordedLectures).where(eq(recordedLectures.id, id));
    return result.rowCount > 0;
  }

  async toggleBookmark(id: number): Promise<RecordedLecture | undefined> {
    const [lecture] = await db.select().from(recordedLectures).where(eq(recordedLectures.id, id));
    if (!lecture) return undefined;

    const [updated] = await db.update(recordedLectures)
      .set({ isBookmarked: !lecture.isBookmarked })
      .where(eq(recordedLectures.id, id))
      .returning();
    return updated;
  }

  async createBulkRecordedLectures(lectures: InsertRecordedLecture[]): Promise<RecordedLecture[]> {
    return await db.insert(recordedLectures).values(
      lectures.map(lecture => ({
        ...lecture,
        views: 0,
        isBookmarked: false,
      }))
    ).returning();
  }
}
