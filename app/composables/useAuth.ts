import { ref } from 'vue'
import { useRouter } from 'vue-router'

interface User {
  id: number
  username: string
}

export const useAuth = () => {
  const user = useState<User | null>('user', () => null)
  const isAuthenticated = useState<boolean>('isAuthenticated', () => false)
  const isAuthReady = useState<boolean>('isAuthReady', () => false)
  const router = useRouter()

  const checkAuth = async () => {
    try {
      const data = await $fetch<User>('/api/auth/me')
      user.value = data
      isAuthenticated.value = true
    } catch (e) {
      user.value = null
      isAuthenticated.value = false
    } finally {
      isAuthReady.value = true
    }
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    isAuthenticated.value = false
    router.push('/login')
  }

  return {
    user,
    isAuthenticated,
    isAuthReady,
    checkAuth,
    logout
  }
}
