import { db } from '../utils/drizzle';
import { images } from '../database/schema';
import { sql, eq } from 'drizzle-orm';
import { requireAuth } from '../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  try {
    const result = await db
      .select({
        totalSize: sql<number>`sum(${images.size})`.mapWith(Number)
      })
      .from(images)
      .where(eq(images.userId, user.userId));

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
