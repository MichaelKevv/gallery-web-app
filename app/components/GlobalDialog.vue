<script setup lang="ts">
import { useDialog } from '../composables/useDialog'
import { nextTick, ref, watch } from 'vue'

const { state, closeDialog } = useDialog()
const inputRef = ref<HTMLInputElement | null>(null)

watch(() => state.value.isOpen, (newVal) => {
  if (newVal && state.value.type === 'prompt') {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

const handleConfirm = () => {
  if (state.value.type === 'prompt') {
    closeDialog(state.value.inputValue)
  } else {
    closeDialog(true)
  }
}

const handleCancel = () => {
  if (state.value.type === 'prompt') {
    closeDialog(null)
  } else {
    closeDialog(false)
  }
}
</script>

<template>
  <div v-if="state.isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" @click="handleCancel"></div>
    
    <!-- Dialog Box -->
    <div class="relative bg-dark-surface border border-white/10 rounded-2xl shadow-2xl shadow-neon-cyan/10 max-w-sm w-full overflow-hidden transform transition-all p-6 ring-1 ring-white/5">
      <!-- Icon based on type -->
      <div class="w-12 h-12 rounded-full mb-4 flex items-center justify-center" 
           :class="{
             'bg-neon-cyan/20 text-neon-cyan': state.type === 'alert',
             'bg-yellow-400/20 text-yellow-400': state.type === 'confirm',
             'bg-neon-purple/20 text-neon-purple': state.type === 'prompt'
           }">
        <span class="material-icons-outlined text-2xl">
          {{ state.type === 'alert' ? 'info' : state.type === 'confirm' ? 'warning_amber' : 'edit_note' }}
        </span>
      </div>

      <!-- Content -->
      <h3 class="text-xl font-display font-semibold text-white mb-2">{{ state.title }}</h3>
      <p class="text-gray-400 text-sm mb-6">{{ state.message }}</p>

      <!-- Prompt Input -->
      <div v-if="state.type === 'prompt'" class="mb-6">
        <input 
          ref="inputRef"
          v-model="state.inputValue" 
          type="text" 
          :placeholder="state.placeholder"
          class="w-full bg-dark-bg/50 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all shadow-inner"
          @keyup.enter="handleConfirm"
        >
      </div>

      <!-- Actions -->
      <div class="flex items-center justify-end gap-3 mt-2">
        <button v-if="state.type !== 'alert'" @click="handleCancel" class="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
          {{ state.cancelText }}
        </button>
        <button @click="handleConfirm" class="px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r transition-all hover:shadow-lg transform hover:-translate-y-0.5 text-white shadow-md"
                :class="{
                  'from-neon-cyan to-blue-500 hover:shadow-neon-cyan/30': state.type === 'alert',
                  'from-red-500 to-pink-600 hover:shadow-red-500/30': state.type === 'confirm',
                  'from-neon-purple to-neon-cyan hover:shadow-neon-purple/30': state.type === 'prompt'
                }">
          {{ state.confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>
