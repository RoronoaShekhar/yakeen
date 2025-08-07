
import { db } from './db';
import { sql } from 'drizzle-orm';

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');
    
    // Wait a moment for connection to establish
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create live_lectures table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS live_lectures (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        lecture_url TEXT NOT NULL,
        subject TEXT NOT NULL,
        is_live BOOLEAN DEFAULT false,
        viewers INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log('✓ live_lectures table created/verified');
    
    // Create recorded_lectures table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS recorded_lectures (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        youtube_url TEXT NOT NULL,
        views INTEGER DEFAULT 0,
        upload_date TIMESTAMP DEFAULT NOW(),
        is_bookmarked BOOLEAN DEFAULT false
      )
    `);
    console.log('✓ recorded_lectures table created/verified');
    
    // Verify tables exist by checking their structure
    const liveLecturesCheck = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'live_lectures' 
      ORDER BY ordinal_position
    `);
    
    const recordedLecturesCheck = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'recorded_lectures' 
      ORDER BY ordinal_position
    `);
    
    console.log('Database tables verification:');
    console.log(`- live_lectures: ${liveLecturesCheck.length} columns`);
    console.log(`- recorded_lectures: ${recordedLecturesCheck.length} columns`);
    
    // Test the connection with a simple query
    const testResult = await db.execute(sql`SELECT 1 as test`);
    console.log('✓ Database connection test passed');
    
  } catch (error) {
    console.error('Database setup failed:', error);
    if (error.message.includes('timeout')) {
      console.log('💡 Tip: Your database might be sleeping. Try running this command again.');
    }
    throw error;
  }
}

setupDatabase().then(() => {
  console.log('🎉 Database setup completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Database setup failed:', error);
  process.exit(1);
});
