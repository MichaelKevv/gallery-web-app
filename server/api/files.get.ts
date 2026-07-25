import { db } from '../utils/drizzle';
import { images } from '../database/schema';
import { desc, eq, and, gte } from 'drizzle-orm';
import { requireAuth } from '../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const query = getQuery(event);
  const view = query.view as string || 'dashboard';

  let condition = undefined;

  switch (view) {
    case 'shared':
      condition = and(eq(images.userId, user.userId), eq(images.isShared, true), eq(images.isTrashed, false));
      break;
    case 'favorites':
      condition = and(eq(images.userId, user.userId), eq(images.isFavorite, true), eq(images.isTrashed, false));
      break;
    case 'trash':
      condition = and(eq(images.userId, user.userId), eq(images.isTrashed, true));
      break;
    case 'recent':
      // 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      condition = and(eq(images.userId, user.userId), gte(images.createdAt, sevenDaysAgo), eq(images.isTrashed, false));
      break;
    case 'dashboard':
    default:
      condition = and(eq(images.userId, user.userId), eq(images.isTrashed, false));
      break;
  }

  try {
    const files = await db
      .select()
      .from(images)
      .where(condition)
      .orderBy(desc(images.createdAt));

    return files;
  } catch (e: any) {
    throw createError({ statusCode: 500, statusMessage: e.message });
  }
});
