import { LiveLecture, RecordedLecture, InsertLiveLecture, InsertRecordedLecture } from "@shared/schema";
import { db } from "./db";
import { liveLectures, recordedLectures } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Live Lectures
  createLiveLecture(lecture: InsertLiveLecture): Promise<LiveLecture>;
  getLiveLectures(): Promise<LiveLecture[]>;
  updateLiveLecture(id: number, updates: Partial<LiveLecture>): Promise<LiveLecture | undefined>;
  deleteLiveLecture(id: number): Promise<boolean>;
  deleteExpiredLiveLectures(): Promise<number>;

  // Recorded Lectures
  createRecordedLecture(lecture: InsertRecordedLecture): Promise<RecordedLecture>;
  getRecordedLectures(subject?: string): Promise<RecordedLecture[]>;
  getRecordedLecturesBySubject(subject: string): Promise<RecordedLecture[]>;
  updateRecordedLecture(id: number, updates: Partial<RecordedLecture>): Promise<RecordedLecture | undefined>;
  deleteRecordedLecture(id: number): Promise<boolean>;
  toggleBookmark(id: number): Promise<RecordedLecture | undefined>;
}

export class MemStorage implements IStorage {
  private liveLectures: Map<number, LiveLecture>;
  private recordedLectures: Map<number, RecordedLecture>;
  private currentLiveId: number;
  private currentRecordedId: number;

  constructor() {
    this.liveLectures = new Map();
    this.recordedLectures = new Map();
    this.currentLiveId = 1;
    this.currentRecordedId = 1;

    // Start cleanup interval for expired live lectures
    setInterval(async () => {
      const deletedCount = await this.deleteExpiredLiveLectures();
      if (deletedCount > 0) {
        console.log(`[Storage] Deleted ${deletedCount} expired live lectures`);
      }
    }, 60000); // Check every minute

    // Keep-alive ping to prevent hosting platform sleep
    setInterval(() => {
      try {
        // Self-ping to keep the server alive
        fetch('http://localhost:5000/api/ping').catch(() => {
          // Ignore fetch errors, this is just to keep the server alive
        });
      } catch (error) {
        // Ignore any errors - this is just a keep-alive mechanism
      }
    }, 11 * 60 * 1000); // Ping every 11 minutes

    console.log(`[Storage] Initialized with ${this.recordedLectures.size} recorded lectures`);
  }

  // Live Lectures
  async createLiveLecture(insertLecture: InsertLiveLecture): Promise<LiveLecture> {
    const id = this.currentLiveId++;
    const lecture: LiveLecture = {
      ...insertLecture,
      id,
      isLive: true,
      viewers: 0,
      createdAt: new Date(),
    };
    this.liveLectures.set(id, lecture);
    return lecture;
  }

  async getLiveLectures(): Promise<LiveLecture[]> {
    return Array.from(this.liveLectures.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async updateLiveLecture(id: number, updates: Partial<LiveLecture>): Promise<LiveLecture | undefined> {
    const lecture = this.liveLectures.get(id);
    if (!lecture) return undefined;
    
    const updated = { ...lecture, ...updates };
    this.liveLectures.set(id, updated);
    return updated;
  }

  async deleteLiveLecture(id: number): Promise<boolean> {
    return this.liveLectures.delete(id);
  }



  async deleteExpiredLiveLectures(): Promise<number> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    let deletedCount = 0;
    const lectureEntries = Array.from(this.liveLectures.entries());
    for (const [id, lecture] of lectureEntries) {
      if (lecture.createdAt && new Date(lecture.createdAt) < oneDayAgo) {
        this.liveLectures.delete(id);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  // Recorded Lectures
  async createRecordedLecture(insertLecture: InsertRecordedLecture): Promise<RecordedLecture> {
    const id = this.currentRecordedId++;
    const lecture: RecordedLecture = {
      ...insertLecture,
      id,
      views: 0,
      uploadDate: new Date(),
      isBookmarked: false,
    };
    this.recordedLectures.set(id, lecture);
    console.log(`[Storage] Created recorded lecture: ${lecture.title} (ID: ${id}). Total: ${this.recordedLectures.size}`);
    return lecture;
  }

  async getRecordedLectures(subject?: string): Promise<RecordedLecture[]> {
    let lectures = Array.from(this.recordedLectures.values());
    
    if (subject) {
      lectures = lectures.filter(lecture => lecture.subject === subject);
    }
    
    const sorted = lectures.sort((a, b) => 
      new Date(b.uploadDate!).getTime() - new Date(a.uploadDate!).getTime()
    );
    
    console.log(`[Storage] Retrieved ${sorted.length} recorded lectures${subject ? ` for subject: ${subject}` : ''}`);
    return sorted;
  }

  async getRecordedLecturesBySubject(subject: string): Promise<RecordedLecture[]> {
    return this.getRecordedLectures(subject);
  }

  async updateRecordedLecture(id: number, updates: Partial<RecordedLecture>): Promise<RecordedLecture | undefined> {
    const lecture = this.recordedLectures.get(id);
    if (!lecture) return undefined;
    
    const updated = { ...lecture, ...updates };
    this.recordedLectures.set(id, updated);
    return updated;
  }

  async deleteRecordedLecture(id: number): Promise<boolean> {
    return this.recordedLectures.delete(id);
  }

  async toggleBookmark(id: number): Promise<RecordedLecture | undefined> {
    const lecture = this.recordedLectures.get(id);
    if (!lecture) return undefined;
    
    const updated = { ...lecture, isBookmarked: !lecture.isBookmarked };
    this.recordedLectures.set(id, updated);
    return updated;
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  constructor() {
    // Start cleanup interval for expired live lectures
    setInterval(async () => {
      const deletedCount = await this.deleteExpiredLiveLectures();
      if (deletedCount > 0) {
        console.log(`[Storage] Deleted ${deletedCount} expired live lectures`);
      }
    }, 60000); // Check every minute

    // Keep-alive ping to prevent hosting platform sleep
    setInterval(() => {
      try {
        // Self-ping to keep the server alive
        fetch('http://localhost:5000/api/ping').catch(() => {
          // Ignore fetch errors, this is just to keep the server alive
        });
      } catch (error) {
        // Ignore any errors - this is just a keep-alive mechanism
      }
    }, 11 * 60 * 1000); // Ping every 11 minutes

    console.log(`[Storage] Database storage initialized`);
  }

  // Live Lectures (still in-memory for now)
  private liveLecturesMap: Map<number, LiveLecture> = new Map();
  private currentLiveId: number = 1;

  async createLiveLecture(insertLecture: InsertLiveLecture): Promise<LiveLecture> {
    const id = this.currentLiveId++;
    const lecture: LiveLecture = {
      ...insertLecture,
      id,
      isLive: true,
      viewers: 0,
      createdAt: new Date(),
    };
    this.liveLecturesMap.set(id, lecture);
    return lecture;
  }

  async getLiveLectures(): Promise<LiveLecture[]> {
    return Array.from(this.liveLecturesMap.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async updateLiveLecture(id: number, updates: Partial<LiveLecture>): Promise<LiveLecture | undefined> {
    const lecture = this.liveLecturesMap.get(id);
    if (!lecture) return undefined;
    
    const updated = { ...lecture, ...updates };
    this.liveLecturesMap.set(id, updated);
    return updated;
  }

  async deleteLiveLecture(id: number): Promise<boolean> {
    return this.liveLecturesMap.delete(id);
  }

  async deleteExpiredLiveLectures(): Promise<number> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    let deletedCount = 0;
    const lectureEntries = Array.from(this.liveLecturesMap.entries());
    for (const [id, lecture] of lectureEntries) {
      if (lecture.createdAt && new Date(lecture.createdAt) < oneDayAgo) {
        this.liveLecturesMap.delete(id);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  // Recorded Lectures (database-backed)
  async createRecordedLecture(insertLecture: InsertRecordedLecture): Promise<RecordedLecture> {
    const [lecture] = await db
      .insert(recordedLectures)
      .values(insertLecture)
      .returning();
    
    console.log(`[Storage] Created recorded lecture: ${lecture.title} (ID: ${lecture.id})`);
    return lecture;
  }

  async getRecordedLectures(subject?: string): Promise<RecordedLecture[]> {
    let lectures: RecordedLecture[];
    
    if (subject) {
      lectures = await db
        .select()
        .from(recordedLectures)
        .where(eq(recordedLectures.subject, subject))
        .orderBy(recordedLectures.uploadDate);
    } else {
      lectures = await db
        .select()
        .from(recordedLectures)
        .orderBy(recordedLectures.uploadDate);
    }
    
    console.log(`[Storage] Retrieved ${lectures.length} recorded lectures${subject ? ` for subject: ${subject}` : ''}`);
    return lectures.reverse(); // Most recent first
  }

  async getRecordedLecturesBySubject(subject: string): Promise<RecordedLecture[]> {
    return this.getRecordedLectures(subject);
  }

  async updateRecordedLecture(id: number, updates: Partial<RecordedLecture>): Promise<RecordedLecture | undefined> {
    const [updated] = await db
      .update(recordedLectures)
      .set(updates)
      .where(eq(recordedLectures.id, id))
      .returning();
    
    return updated || undefined;
  }

  async deleteRecordedLecture(id: number): Promise<boolean> {
    const result = await db
      .delete(recordedLectures)
      .where(eq(recordedLectures.id, id));
    
    return result.rowCount !== null && result.rowCount > 0;
  }

  async toggleBookmark(id: number): Promise<RecordedLecture | undefined> {
    // First get the current lecture to toggle the bookmark
    const [currentLecture] = await db
      .select()
      .from(recordedLectures)
      .where(eq(recordedLectures.id, id));
    
    if (!currentLecture) return undefined;
    
    const [updated] = await db
      .update(recordedLectures)
      .set({ isBookmarked: !currentLecture.isBookmarked })
      .where(eq(recordedLectures.id, id))
      .returning();
    
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
