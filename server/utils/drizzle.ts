import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../database/schema';

const sql = neon(process.env.DATABASE_URL!);

// Export a drizzle instance
export const db = drizzle(sql, { schema });
