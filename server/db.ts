import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

let connectionString = process.env.DATABASE_URL;

// Use connection pooler for better performance and reliability
if (!connectionString.includes('-pooler')) {
  connectionString = connectionString.replace('.us-east-2', '-pooler.us-east-2');
}

console.log('Connecting to database with connection pooling...');

const client = postgres(connectionString, {
  ssl: 'require',
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 60, // Increased timeout for sleeping databases
  max_lifetime: 60 * 30, // 30 minutes
  prepare: false, // Disable prepared statements for pooler compatibility
});

export const db = drizzle(client, { schema });

// Test connection with retry logic
async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await client`SELECT 1`;
      console.log('Database connected successfully');
      return;
    } catch (error) {
      console.log(`Connection attempt ${i + 1} failed, retrying...`);
      if (i === retries - 1) {
        console.error('Database connection failed after retries:', error);
      } else {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      }
    }
  }
}

testConnection();