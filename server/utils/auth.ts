import { SignJWT, jwtVerify } from 'jose'
import { getCookie, setCookie, deleteCookie, H3Event } from 'h3'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_for_dev_only_change_this_in_prod')

export const createToken = async (userId: number, username: string) => {
  return await new SignJWT({ userId, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export const verifyToken = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as { userId: number, username: string }
  } catch (e) {
    return null
  }
}

export const setAuthCookie = (event: H3Event, token: string) => {
  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  })
}

export const clearAuthCookie = (event: H3Event) => {
  deleteCookie(event, 'auth_token')
}

export const requireAuth = async (event: H3Event) => {
  const token = getCookie(event, 'auth_token')
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  
  const payload = await verifyToken(token)
  if (!payload) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }
  
  return payload
}
