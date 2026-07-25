import { db } from '../utils/drizzle';
import { images } from '../database/schema';
import { put } from '@vercel/blob';
import { requireAuth } from '../utils/auth';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  try {
    const formData = await readFormData(event);
    const file = formData.get('file') as File;

    if (!file) {
      throw createError({ statusCode: 400, statusMessage: 'No file uploaded' });
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    // Save metadata to Vercel Postgres
    const [savedImage] = await db.insert(images).values({
      userId: user.userId,
      name: file.name,
      url: blob.url,
      size: file.size,
    }).returning();

    return savedImage;
  } catch (e: any) {
    throw createError({ statusCode: 500, statusMessage: e.message });
  }
});
