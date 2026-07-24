import { db } from '../utils/drizzle';
import { images } from '../database/schema';
import { sql } from 'drizzle-orm';

export default defineEventHandler(async () => {
  try {
    const result = await db
      .select({
        totalSize: sql<number>`sum(${images.size})`.mapWith(Number)
      })
      .from(images);

    const usedBytes = result[0]?.totalSize || 0;
    
    const QUOTA_BYTES = 250 * 1024 * 1024; 
    
    const percentage = Math.min(100, Math.round((usedBytes / QUOTA_BYTES) * 100));

    return {
      usedBytes,
      quotaBytes: QUOTA_BYTES,
      percentage
    };
  } catch (e: any) {
    throw createError({ statusCode: 500, statusMessage: e.message });
  }
});
