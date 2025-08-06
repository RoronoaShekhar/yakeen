
import { db } from './db';
import { sql } from 'drizzle-orm';

async function resetDatabase() {
  try {
    console.log('Starting complete database reset...');
    
    // Drop all tables if they exist (with CASCADE to handle dependencies)
    console.log('Dropping all existing tables...');
    await db.execute(sql`DROP TABLE IF EXISTS live_lectures CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS recorded_lectures CASCADE`);
    
    // Drop any other potential tables that might exist
    await db.execute(sql`DROP TABLE IF EXISTS lectures CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE`);
    
    console.log('All tables dropped successfully');
    
    // Clear any sequences that might exist
    await db.execute(sql`DROP SEQUENCE IF EXISTS live_lectures_id_seq CASCADE`);
    await db.execute(sql`DROP SEQUENCE IF EXISTS recorded_lectures_id_seq CASCADE`);
    
    console.log('Database reset completed successfully!');
    console.log('All data has been deleted. Ready for schema recreation.');
    
  } catch (error) {
    console.error('Database reset failed:', error);
  } finally {
    process.exit(0);
  }
}

resetDatabase();
