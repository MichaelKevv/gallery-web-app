import { db } from '../../utils/drizzle'
import { users } from '../../database/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { createToken, setAuthCookie } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Username and password are required' })
  }

  // Find user
  const existingUsers = await db.select().from(users).where(eq(users.username, username)).limit(1)
  
  if (existingUsers.length === 0) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
  }

  const user = existingUsers[0]

  // Compare password
  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
  }

  // Generate Token and set Cookie
  const token = await createToken(user.id, user.username)
  setAuthCookie(event, token)

  return {
    id: user.id,
    username: user.username
  }
})
