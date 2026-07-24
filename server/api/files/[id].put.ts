import { db } from '../../utils/drizzle';
import { images } from '../../database/schema';
import { eq } from 'drizzle-orm';

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params?.id as string);
  
  if (isNaN(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' });
  }

  const body = await readBody(event);

  try {
    const [updatedImage] = await db
      .update(images)
      .set(body)
      .where(eq(images.id, id))
      .returning();

    return updatedImage;
  } catch (e: any) {
    throw createError({ statusCode: 500, statusMessage: e.message });
  }
});
