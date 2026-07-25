import { db } from '../../utils/drizzle';
import { images } from '../../database/schema';
import { eq, and } from 'drizzle-orm';
import { del } from '@vercel/blob';
import { requireAuth } from '../../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const id = parseInt(event.context.params?.id as string);
  
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });
  }

  try {
    // 1. Get the image url first
    const [image] = await db.select().from(images).where(and(eq(images.id, id), eq(images.userId, user.userId)));
    if (!image) {
      throw createError({ statusCode: 404, statusMessage: 'Image not found' });
    }

    // 2. Delete from Vercel Blob
    await del(image.url);

    // 3. Delete from Vercel Postgres
    await db.delete(images).where(and(eq(images.id, id), eq(images.userId, user.userId)));

    return { success: true };
  } catch (e: any) {
    throw createError({ statusCode: 500, statusMessage: e.message });
  }
});
