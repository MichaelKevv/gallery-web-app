<script setup lang="ts">
import { ref } from 'vue'

const viewLayout = ref<'grid' | 'list'>('grid')
const { data: files, refresh, pending } = useFetch('/api/files?view=shared')

const modalOpen = ref(false)
const modalFile = ref(null)
const modalType = ref<'image' | 'video'>('image')

const openPreview = (file: any, type: 'image' | 'video') => {
  modalFile.value = file
  modalType.value = type
  modalOpen.value = true
}

const { showAlert, showPrompt } = useDialog()

const renameFile = async (file: any) => {
  const newName = await showPrompt('Rename File', 'Enter a new name for the file:', file.name, 'File name')
  if (newName && newName !== file.name) {
    await $fetch(`/api/files/${file.id}`, {
      method: 'PUT',
      body: { name: newName }
    })
    refresh()
  }
}

const toggleFavorite = async (file: any) => {
  await $fetch(`/api/files/${file.id}`, {
    method: 'PUT',
    body: { isFavorite: !file.isFavorite }
  })
  refresh()
}

const toggleTrash = async (file: any) => {
  await $fetch(`/api/files/${file.id}`, {
    method: 'PUT',
    body: { isTrashed: !file.isTrashed }
  })
  refresh()
}

const shareFile = async (file: any) => {
  await navigator.clipboard.writeText(file.url)
  await $fetch(`/api/files/${file.id}`, {
    method: 'PUT',
    body: { isShared: true }
  })
  refresh()
  await showAlert('Link Copied', 'The file link has been copied to your clipboard.')
}
</script>

<template>
  <div>
    <!-- Breadcrumbs / Title -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="font-display text-2xl lg:text-3xl font-bold text-white mb-1">Shared</h1>
        <p class="text-gray-500 text-sm">Files you have shared</p>
      </div>
      
      <div class="flex bg-dark-surface rounded-lg p-1 border border-white/5">
        <button @click="viewLayout = 'grid'" :class="['p-1.5 rounded-md transition-all', viewLayout === 'grid' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white']">
          <span class="material-icons-outlined text-xl">grid_view</span>
        </button>
        <button @click="viewLayout = 'list'" :class="['p-1.5 rounded-md transition-all', viewLayout === 'list' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white']">
          <span class="material-icons-outlined text-xl">list</span>
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="mb-6">
      <div class="flex items-center gap-3 bg-neon-cyan/10 border border-neon-cyan/20 p-4 rounded-xl">
        <div class="animate-spin rounded-full h-5 w-5 border-2 border-neon-cyan border-t-transparent"></div>
        <span class="text-neon-cyan text-sm font-medium">Syncing with the server...</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!files || files.length === 0" class="flex flex-col items-center justify-center py-24 border-2 border-dashed border-white/10 rounded-3xl">
      <div class="w-20 h-20 bg-dark-lighter/50 rounded-full flex items-center justify-center mb-6">
        <span class="material-icons-outlined text-4xl text-gray-500">cloud_off</span>
      </div>
      <h3 class="text-xl font-display font-medium text-white mb-2">It's empty here</h3>
      <p class="text-gray-500 max-w-md text-center">Drag and drop files to upload or use the "Upload New" button to get started.</p>
    </div>

    <!-- Grid / List -->
    <div v-else :class="viewLayout === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6' : 'flex flex-col gap-3'">
      <FileCard 
        v-for="file in files" 
        :key="file.id" 
        :file="file" 
        :layout="viewLayout"
        @preview="openPreview"
        @rename="renameFile"
        @toggle-favorite="toggleFavorite"
        @toggle-trash="toggleTrash"
        @share="shareFile"
      />
    </div>

    <!-- Modal -->
    <ImageModal 
      :is-open="modalOpen" 
      :file="modalFile" 
      :type="modalType" 
      @close="modalOpen = false" 
    />
  </div>
</template>
