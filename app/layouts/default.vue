<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const uploadProgress = ref(0)
const isUploading = ref(false)

const { showAlert } = useDialog()

const { data: storageData, refresh: refreshStorage } = useFetch('/api/storage')

provide('refreshStorage', refreshStorage)

const handleUpload = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*, video/*'
  input.multiple = true
  input.onchange = async (e: any) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    isUploading.value = true;
    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const formData = new FormData();
        formData.append('file', file);
        
        await $fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
      }
      await showAlert('Upload Successful', 'Your files have been saved to the universe.')
      refreshStorage()
      window.location.reload();
    } catch (err: any) {
      await showAlert('Upload Failed', err.message || 'Something went wrong.')
    } finally {
      isUploading.value = false;
    }
  }
  input.click()
}
</script>

<template>
  <div class="bg-dark-bg text-gray-200 font-sans h-screen flex overflow-hidden selection:bg-neon-cyan selection:text-black">
    <!-- Sidebar (Glassmorphism) -->
    <aside class="w-20 lg:w-64 flex flex-col gap-6 p-4 border-r border-white/10 glass z-20 transition-all duration-300">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-2">
        <div class="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-neon-purple to-neon-cyan rounded-xl shadow-neon-purple">
          <span class="material-icons-outlined text-white text-2xl">all_inclusive</span>
        </div>
        <span class="font-display font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple hidden lg:block">AETHER</span>
      </div>

      <!-- New Button -->
      <button :disabled="isUploading" @click="handleUpload" class="group relative flex items-center justify-center lg:justify-start gap-3 bg-gradient-to-r from-neon-cyan to-neon-purple p-[2px] rounded-xl hover:shadow-neon-cyan transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
        <div class="flex items-center gap-3 w-full h-full bg-dark-bg hover:bg-opacity-90 rounded-xl px-0 lg:px-4 py-3 transition-all">
          <span v-if="isUploading" class="material-icons-outlined text-neon-cyan animate-spin mx-auto lg:mx-0">sync</span>
          <span v-else class="material-icons-outlined text-neon-cyan group-hover:text-white transition-colors mx-auto lg:mx-0">add_circle</span>
          <span class="font-medium hidden lg:block group-hover:text-white transition-colors">{{ isUploading ? 'Uploading...' : 'Upload New' }}</span>
        </div>
      </button>

      <!-- Nav Links -->
      <nav class="flex flex-col gap-2 mt-4">
        <NuxtLink to="/" class="flex items-center gap-4 px-3 py-3 rounded-xl transition-all" :class="route.path === '/' ? 'bg-white/10 text-neon-cyan border-l-2 border-neon-cyan' : 'hover:bg-white/5 text-gray-400 hover:text-white'">
          <span class="material-icons-outlined">dashboard</span>
          <span class="hidden lg:block font-medium">Dashboard</span>
        </NuxtLink>
        <NuxtLink to="/shared" class="flex items-center gap-4 px-3 py-3 rounded-xl transition-all" :class="route.path === '/shared' ? 'bg-white/10 text-neon-cyan border-l-2 border-neon-cyan' : 'hover:bg-white/5 text-gray-400 hover:text-white'">
          <span class="material-icons-outlined">folder_shared</span>
          <span class="hidden lg:block">Shared</span>
        </NuxtLink>
        <NuxtLink to="/recent" class="flex items-center gap-4 px-3 py-3 rounded-xl transition-all" :class="route.path === '/recent' ? 'bg-white/10 text-neon-cyan border-l-2 border-neon-cyan' : 'hover:bg-white/5 text-gray-400 hover:text-white'">
          <span class="material-icons-outlined">access_time</span>
          <span class="hidden lg:block">Recent</span>
        </NuxtLink>
        <NuxtLink to="/favorites" class="flex items-center gap-4 px-3 py-3 rounded-xl transition-all" :class="route.path === '/favorites' ? 'bg-white/10 text-neon-cyan border-l-2 border-neon-cyan' : 'hover:bg-white/5 text-gray-400 hover:text-white'">
          <span class="material-icons-outlined">star_border</span>
          <span class="hidden lg:block">Favorites</span>
        </NuxtLink>
        <NuxtLink to="/trash" class="flex items-center gap-4 px-3 py-3 rounded-xl transition-all" :class="route.path === '/trash' ? 'bg-white/10 text-neon-cyan border-l-2 border-neon-cyan' : 'hover:bg-white/5 text-gray-400 hover:text-white'">
          <span class="material-icons-outlined">delete</span>
          <span class="hidden lg:block">Trash</span>
        </NuxtLink>
      </nav>

      <!-- Storage Status -->
      <div class="mt-auto hidden lg:block p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/0 border border-white/5">
        <div class="flex justify-between items-end mb-2">
          <span class="text-xs text-gray-400">Storage</span>
          <span class="text-xs font-bold text-neon-cyan">{{ storageData?.percentage || 0 }}%</span>
        </div>
        <div class="h-1.5 w-full bg-dark-bg rounded-full overflow-hidden mb-2">
          <div class="h-full bg-gradient-to-r from-neon-cyan to-neon-purple shadow-neon-cyan transition-all duration-1000" :style="`width: ${storageData?.percentage || 0}%`"></div>
        </div>
        <div class="flex justify-between items-center text-[10px] text-gray-500">
          <span>{{ storageData ? (storageData.usedBytes / (1024 * 1024)).toFixed(1) : 0 }} MB used</span>
          <span>{{ storageData ? (storageData.quotaBytes / (1024 * 1024)).toFixed(0) : 250 }} MB total</span>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col backdrop-blur-sm overflow-hidden relative">
      <!-- Background Elements -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-[400px] h-[400px] bg-neon-cyan/5 rounded-full blur-[100px] pointer-events-none"></div>

      <!-- Header -->
      <header class="h-20 flex items-center justify-between px-6 z-10 border-b border-white/5">
        <!-- Search -->
        <div class="flex-1 max-w-xl">
          <div class="relative group">
            <span class="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-neon-cyan transition-colors">search</span>
            <input type="text" placeholder="Search your universe..." class="w-full bg-dark-bg/50 border border-white/10 rounded-full py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all shadow-inner placeholder-gray-600">
          </div>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-4 ml-6">
          <button class="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
            <span class="material-icons-outlined">notifications</span>
          </button>
          <div class="w-10 h-10 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink p-[2px] cursor-pointer">
            <div class="w-full h-full rounded-full bg-dark-bg flex items-center justify-center">
              <span class="font-bold text-white text-sm">U</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Content Scroll Area -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 z-10">
        <slot />
      </div>
    </main>
  </div>
</template>
