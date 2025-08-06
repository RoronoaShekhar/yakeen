
import { db } from './db';
import { recordedLectures } from '@shared/schema';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Add a sample recorded lecture
    const sampleLecture = {
      title: "Introduction to Physics",
      subject: "physics",
      youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
    };

    const [newLecture] = await db.insert(recordedLectures).values(sampleLecture).returning();
    console.log('Sample lecture added successfully:', newLecture);

    // Test fetching lectures
    const allLectures = await db.select().from(recordedLectures);
    console.log('Total lectures in database:', allLectures.length);

    console.log('Database connection test completed successfully!');
  } catch (error) {
    console.error('Database connection test failed:', error);
  } finally {
    process.exit(0);
  }
}

testDatabase();
