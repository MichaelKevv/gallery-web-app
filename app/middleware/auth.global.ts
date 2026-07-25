export default defineNuxtRouteMiddleware(async (to, from) => {
  const { isAuthenticated, isAuthReady, checkAuth } = useAuth()

  // Always check auth on SSR or if not ready on client
  if (!isAuthReady.value) {
    await checkAuth()
  }

  // If trying to access any page other than login while not authenticated
  if (!isAuthenticated.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  // If trying to access login while authenticated
  if (isAuthenticated.value && to.path === '/login') {
    return navigateTo('/')
  }
})
