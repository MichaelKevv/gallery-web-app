<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: false // Do not use the default layout with sidebar
})

const { checkAuth } = useAuth()
const { showAlert } = useDialog()
const router = useRouter()

const isLogin = ref(true)
const username = ref('')
const password = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  if (!username.value || !password.value) {
    showAlert('Error', 'Please fill in all fields.')
    return
  }

  isLoading.value = true
  try {
    const endpoint = isLogin.value ? '/api/auth/login' : '/api/auth/register'
    await $fetch(endpoint, {
      method: 'POST',
      body: { username: username.value, password: password.value }
    })
    
    // Refresh auth state globally
    await checkAuth()
    router.push('/')
  } catch (e: any) {
    showAlert('Error', e.data?.statusMessage || e.message || 'Authentication failed.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-dark-bg text-white font-sans flex items-center justify-center p-4">
    <!-- Background Accents -->
    <div class="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <div class="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-neon-cyan/20 blur-[120px] rounded-full"></div>
      <div class="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-neon-purple/20 blur-[120px] rounded-full"></div>
    </div>

    <!-- Auth Card -->
    <div class="relative z-10 w-full max-w-md bg-dark-surface/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl shadow-neon-cyan/5">
      
      <!-- Logo / Title -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 mb-4 border border-white/5">
          <span class="material-icons-outlined text-3xl text-neon-cyan">photo_library</span>
        </div>
        <h1 class="text-3xl font-display font-bold bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">Nexus Gallery</h1>
        <p class="text-gray-400 mt-2 text-sm">{{ isLogin ? 'Sign in to access your private gallery' : 'Create an account to start storing' }}</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1 ml-1">Username</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-500 text-sm">person</span>
            <input 
              v-model="username" 
              type="text" 
              class="w-full bg-dark-bg/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all placeholder:text-gray-600"
              placeholder="Enter your username"
            >
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1 ml-1">Password</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 material-icons-outlined text-gray-500 text-sm">lock</span>
            <input 
              v-model="password" 
              type="password" 
              class="w-full bg-dark-bg/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all placeholder:text-gray-600"
              placeholder="••••••••"
            >
          </div>
        </div>

        <button 
          type="submit" 
          :disabled="isLoading"
          class="w-full py-3 mt-6 rounded-xl font-medium text-white bg-gradient-to-r from-neon-cyan to-neon-purple shadow-lg shadow-neon-cyan/20 hover:shadow-neon-cyan/40 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          <span v-if="isLoading" class="material-icons-outlined animate-spin text-sm">sync</span>
          {{ isLogin ? 'Sign In' : 'Create Account' }}
        </button>
      </form>

      <!-- Toggle Mode -->
      <div class="mt-6 text-center text-sm text-gray-400">
        <span v-if="isLogin">
          Don't have an account? 
          <button @click="isLogin = false" class="text-neon-cyan hover:text-white transition-colors font-medium">Register here</button>
        </span>
        <span v-else>
          Already have an account? 
          <button @click="isLogin = true" class="text-neon-cyan hover:text-white transition-colors font-medium">Sign in</button>
        </span>
      </div>
    </div>
  </div>
</template>
