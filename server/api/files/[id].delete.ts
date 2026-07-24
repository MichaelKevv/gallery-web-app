import { db } from '../../utils/drizzle';
import { images } from '../../database/schema';
import { eq } from 'drizzle-orm';
import { del } from '@vercel/blob';

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id as string);
  
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });
  }

  try {
    // Get file info to delete from Blob
    const [file] = await db.select().from(images).where(eq(images.id, id));
    
    if (file && file.url) {
      await del(file.url);
    }

    // Delete from DB
    await db.delete(images).where(eq(images.id, id));

    return { success: true };
  } catch (e: any) {
    throw createError({ statusCode: 500, statusMessage: e.message });
  }
});
