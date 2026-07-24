<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  file: any
  type: 'image' | 'video'
}>()

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 transition-opacity duration-300">
    <div class="absolute inset-0 bg-black/90 backdrop-blur-md" @click="close"></div>
    <div class="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
      <div class="relative max-w-7xl w-full max-h-screen flex flex-col items-center pointer-events-auto">
        <img v-if="type === 'image'" :src="file?.url" :alt="file?.name" class="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl shadow-neon-cyan/20">
        <video v-else-if="type === 'video'" :src="file?.url" controls autoplay class="max-h-[85vh] max-w-full rounded-lg shadow-2xl shadow-neon-cyan/20"></video>
        <h3 class="mt-4 text-white font-display text-lg font-medium tracking-wide">{{ file?.name }}</h3>
        
        <button @click="close" class="fixed top-6 right-6 z-[60] p-2 bg-black/50 hover:bg-white/20 rounded-full text-gray-400 hover:text-white transition-all backdrop-blur-sm ring-1 ring-white/10">
          <span class="material-icons-outlined text-3xl">close</span>
        </button>
      </div>
    </div>
  </div>
</template>
