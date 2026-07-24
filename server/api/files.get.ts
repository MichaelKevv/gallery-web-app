import { db } from '../utils/drizzle';
import { images } from '../database/schema';
import { desc, eq, and, gte } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const view = query.view as string || 'dashboard';

  let conditions = [];

  if (view === 'dashboard') {
    conditions.push(eq(images.isTrashed, false));
  } else if (view === 'shared') {
    conditions.push(eq(images.isTrashed, false));
    conditions.push(eq(images.isShared, true));
  } else if (view === 'recent') {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    conditions.push(eq(images.isTrashed, false));
    conditions.push(gte(images.createdAt, sevenDaysAgo));
  } else if (view === 'favorites') {
    conditions.push(eq(images.isTrashed, false));
    conditions.push(eq(images.isFavorite, true));
  } else if (view === 'trash') {
    conditions.push(eq(images.isTrashed, true));
  }

  try {
    const files = await db
      .select()
      .from(images)
      .where(and(...conditions))
      .orderBy(desc(images.createdAt));

    return files;
  } catch (e: any) {
    throw createError({ statusCode: 500, statusMessage: e.message });
  }
});
