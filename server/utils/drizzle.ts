import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from '../database/schema';

// Export a drizzle instance
export const db = drizzle(sql, { schema });
