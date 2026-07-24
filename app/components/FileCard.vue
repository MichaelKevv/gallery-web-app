<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  file: any
  layout: 'grid' | 'list'
}>()

const emit = defineEmits(['preview', 'rename', 'toggle-favorite', 'toggle-trash', 'share', 'delete-permanently', 'restore'])

const isVideo = computed(() => {
  return props.file.url?.match(/\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv)$/i)
})

const sizeMB = computed(() => {
  return (props.file.size ? props.file.size / (1024 * 1024) : 0).toFixed(2)
})

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <div v-if="layout === 'grid'" class="group relative flex flex-col justify-between bg-dark-surface border border-white/5 rounded-2xl hover:shadow-neon-cyan transition-all duration-300 transform hover:-translate-y-1 h-56 z-0 hover:z-20">
    <div class="absolute inset-0 bg-gradient-to-b from-neon-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0 rounded-2xl"></div>
    
    <div class="h-40 w-full bg-dark-bg/50 flex items-center justify-center overflow-hidden relative z-1 p-2 cursor-pointer rounded-t-2xl" @click="emit('preview', file, isVideo ? 'video' : 'image')">
      <div v-if="isVideo" class="w-full h-full flex items-center justify-center bg-black/50 relative">
        <span class="material-icons-outlined text-4xl text-white/80 absolute z-10">play_circle_outline</span>
        <video :src="file.url + '#t=1'" class="object-cover w-full h-full opacity-60 rounded-xl" preload="metadata"></video>
      </div>
      <img v-else :src="file.url" :alt="file.name" class="object-cover w-full h-full rounded-xl" loading="lazy">
      
      <div v-if="file.isShared" class="absolute top-2 left-2 bg-neon-purple/80 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm z-10">Shared</div>
    </div>
    
    <div class="px-3 py-3 bg-dark-surface flex items-center justify-between border-t border-white/5 relative z-10 rounded-b-2xl">
      <div class="flex items-center gap-2 min-w-0">
        <span class="material-icons-outlined text-neon-cyan text-sm">{{ isVideo ? 'movie' : 'image' }}</span>
        <span class="text-sm font-medium text-gray-300 truncate w-24 md:w-32 group-hover:text-white transition-colors" :title="file.name">{{ file.name }}</span>
      </div>
      
      <div class="relative">
        <button @click.stop="toggleMenu" class="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
          <span class="material-icons-outlined">more_vert</span>
        </button>
        <div v-if="isMenuOpen" class="absolute right-0 bottom-full mb-1 w-48 bg-dark-surface border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-white/5">
          <div class="py-1">
            <button @click="emit('preview', file, isVideo ? 'video' : 'image'); toggleMenu()" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
              <span class="material-icons-outlined text-sm text-neon-cyan">visibility</span> Preview
            </button>
            <template v-if="!file.isTrashed">
              <button @click="emit('share', file); toggleMenu()" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
                <span class="material-icons-outlined text-sm" :class="file.isShared ? 'text-neon-purple' : 'text-neon-cyan'">share</span> Share
              </button>
              <button @click="emit('rename', file); toggleMenu()" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
                <span class="material-icons-outlined text-sm text-blue-400">edit</span> Rename
              </button>
              <button @click="emit('toggle-favorite', file); toggleMenu()" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
                <span class="material-icons-outlined text-sm" :class="file.isFavorite ? 'text-yellow-400' : 'text-neon-cyan'">{{ file.isFavorite ? 'star' : 'star_border' }}</span> Favorite
              </button>
              <button @click="emit('toggle-trash', file); toggleMenu()" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-neon-pink flex items-center gap-2 transition-colors">
                <span class="material-icons-outlined text-sm text-neon-pink">delete</span> Move to Trash
              </button>
            </template>
            <template v-else>
              <button @click="emit('restore', file); toggleMenu()" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-green-400 flex items-center gap-2 transition-colors">
                <span class="material-icons-outlined text-sm text-green-400">replay</span> Restore
              </button>
              <button @click="emit('delete-permanently', file); toggleMenu()" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-red-500 flex items-center gap-2 transition-colors">
                <span class="material-icons-outlined text-sm text-red-500">delete_forever</span> Delete Permanently
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex items-center gap-4 p-3 bg-dark-surface border border-white/5 rounded-xl hover:bg-white/5 transition-colors group relative z-0 hover:z-20">
    <div class="w-12 h-12 flex-shrink-0 bg-dark-bg rounded-lg overflow-hidden border border-white/10 relative cursor-pointer" @click="emit('preview', file, isVideo ? 'video' : 'image')">
      <div v-if="isVideo" class="w-full h-full flex items-center justify-center bg-black/50">
        <span class="material-icons-outlined text-white">movie</span>
      </div>
      <img v-else :src="file.url" :alt="file.name" class="w-full h-full object-cover">
      <div v-if="file.isShared" class="absolute bottom-0 right-0 bg-neon-purple w-3 h-3 rounded-tl-lg"></div>
    </div>
    
    <div class="flex-1 min-w-0">
      <h4 class="text-sm font-medium text-gray-200 truncate group-hover:text-neon-cyan transition-colors" :title="file.name">{{ file.name }}</h4>
      <div class="flex items-center gap-3 text-xs text-gray-500 mt-1">
        <span>{{ sizeMB }} MB</span>
        <span>•</span>
        <span>{{ new Date(file.createdAt).toLocaleDateString() }}</span>
        <span v-if="file.isShared" class="text-neon-purple">• Shared</span>
      </div>
    </div>

    <div class="relative ml-auto">
      <button @click.stop="toggleMenu" class="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
        <span class="material-icons-outlined">more_vert</span>
      </button>
      <div v-if="isMenuOpen" class="absolute right-0 top-full mt-2 w-48 bg-dark-surface border border-white/10 rounded-xl shadow-2xl backdrop-blur-lg z-50 overflow-hidden ring-1 ring-white/5">
        <div class="py-1">
            <button @click="emit('preview', file, isVideo ? 'video' : 'image'); toggleMenu()" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
              <span class="material-icons-outlined text-sm text-neon-cyan">visibility</span> Preview
            </button>
            <template v-if="!file.isTrashed">
              <button @click="emit('share', file); toggleMenu()" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
                <span class="material-icons-outlined text-sm" :class="file.isShared ? 'text-neon-purple' : 'text-neon-cyan'">share</span> Share
              </button>
              <button @click="emit('rename', file); toggleMenu()" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
                <span class="material-icons-outlined text-sm text-blue-400">edit</span> Rename
              </button>
              <button @click="emit('toggle-favorite', file); toggleMenu()" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
                <span class="material-icons-outlined text-sm" :class="file.isFavorite ? 'text-yellow-400' : 'text-neon-cyan'">{{ file.isFavorite ? 'star' : 'star_border' }}</span> Favorite
              </button>
              <button @click="emit('toggle-trash', file); toggleMenu()" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-neon-pink flex items-center gap-2 transition-colors">
                <span class="material-icons-outlined text-sm text-neon-pink">delete</span> Move to Trash
              </button>
            </template>
            <template v-else>
              <button @click="emit('restore', file); toggleMenu()" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-green-400 flex items-center gap-2 transition-colors">
                <span class="material-icons-outlined text-sm text-green-400">replay</span> Restore
              </button>
              <button @click="emit('delete-permanently', file); toggleMenu()" class="w-full text-left px-4 py-2 hover:bg-white/10 text-gray-300 hover:text-red-500 flex items-center gap-2 transition-colors">
                <span class="material-icons-outlined text-sm text-red-500">delete_forever</span> Delete Permanently
              </button>
            </template>
        </div>
      </div>
    </div>
  </div>
</template>
