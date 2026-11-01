import type { Toast } from '~/types'

/**
 * Toast Composable - Global toast notifications
 */
export const useToast = () => {
  const toasts = ref<Toast[]>([])
  let idCounter = 0

  const add = (message: string, type: Toast['type'] = 'info', duration = 4000): number => {
    const id = ++idCounter
    toasts.value.push({ id, message, type, duration })

    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }

    return id
  }

  const remove = (id: number) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const clear = () => {
    toasts.value = []
  }

  return {
    toasts: readonly(toasts),
    success: (message: string, duration?: number) => add(message, 'success', duration),
    error: (message: string, duration?: number) => add(message, 'error', duration),
    warning: (message: string, duration?: number) => add(message, 'warning', duration),
    info: (message: string, duration?: number) => add(message, 'info', duration),
    remove,
    clear,
  }
}