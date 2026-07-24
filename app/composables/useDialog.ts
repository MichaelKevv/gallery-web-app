import { ref } from 'vue'

type DialogType = 'alert' | 'confirm' | 'prompt'

interface DialogState {
  isOpen: boolean
  type: DialogType
  title: string
  message: string
  inputValue?: string
  placeholder?: string
  confirmText?: string
  cancelText?: string
  resolvePromise: ((value: any) => void) | null
}

const state = ref<DialogState>({
  isOpen: false,
  type: 'alert',
  title: '',
  message: '',
  inputValue: '',
  placeholder: '',
  confirmText: 'OK',
  cancelText: 'Cancel',
  resolvePromise: null
})

export const useDialog = () => {
  const showAlert = (title: string, message: string, confirmText = 'OK'): Promise<boolean> => {
    return new Promise((resolve) => {
      state.value = {
        isOpen: true,
        type: 'alert',
        title,
        message,
        confirmText,
        resolvePromise: resolve
      }
    })
  }

  const showConfirm = (title: string, message: string, confirmText = 'Yes', cancelText = 'No'): Promise<boolean> => {
    return new Promise((resolve) => {
      state.value = {
        isOpen: true,
        type: 'confirm',
        title,
        message,
        confirmText,
        cancelText,
        resolvePromise: resolve
      }
    })
  }

  const showPrompt = (title: string, message: string, initialValue = '', placeholder = '', confirmText = 'Save', cancelText = 'Cancel'): Promise<string | null> => {
    return new Promise((resolve) => {
      state.value = {
        isOpen: true,
        type: 'prompt',
        title,
        message,
        inputValue: initialValue,
        placeholder,
        confirmText,
        cancelText,
        resolvePromise: resolve
      }
    })
  }

  const closeDialog = (result: any) => {
    state.value.isOpen = false
    if (state.value.resolvePromise) {
      state.value.resolvePromise(result)
      state.value.resolvePromise = null
    }
  }

  return {
    state,
    showAlert,
    showConfirm,
    showPrompt,
    closeDialog
  }
}
