import { db } from '../../utils/drizzle'
import { users } from '../../database/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { createToken, setAuthCookie } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { username, password } = body

  if (!username || !password || password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid username or password (min 6 characters)' })
  }

  // Check if username exists
  const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1)
  
  if (existingUser.length > 0) {
    throw createError({ statusCode: 400, statusMessage: 'Username is already taken' })
  }

  // Hash password
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  // Insert user
  const [newUser] = await db.insert(users).values({
    username,
    password: hashedPassword,
  }).returning({ id: users.id, username: users.username })

  // Generate Token and set Cookie
  const token = await createToken(newUser.id, newUser.username)
  setAuthCookie(event, token)

  return {
    id: newUser.id,
    username: newUser.username
  }
})
