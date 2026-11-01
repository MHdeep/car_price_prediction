<template>
  <Teleport to="body">
    <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      <TransitionGroup name="toast" tag="div" class="flex flex-col gap-2">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-start gap-3 p-4 rounded-xl border shadow-lg pointer-events-auto animate-slide-in',
            typeClasses(toast.type),
          ]"
          role="alert"
          :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
        >
          <!-- Icon -->
          <div class="flex-shrink-0 mt-0.5" :class="iconClasses(toast.type)">
            <component :is="getIcon(toast.type)" class="w-5 h-5" />
          </div>

          <!-- Message -->
          <div class="flex-1 min-w-0">
            <p v-if="toast.title" class="font-medium text-sm">{{ toast.title }}</p>
            <p class="text-sm leading-relaxed">{{ toast.message }}</p>
          </div>

          <!-- Close button -->
          <button
            type="button"
            class="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors"
            @click="remove(toast.id)"
            :aria-label="`بستن پیام: ${toast.message}`"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Progress bar -->
          <div
            v-if="toast.duration && toast.duration > 0"
            class="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-xl overflow-hidden"
          >
            <div
              class="h-full bg-current opacity-30"
              :style="{ width: `${toast.progress}%` }"
              :class="{ 'animate-progress': toast.duration > 0 }"
            />
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { Toast } from '~/types'

interface Props {
  toasts: Toast[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  remove: [id: number]
}>()

const progressTimers = new Map<number, number>()

function remove(id: number) {
  emit('remove', id)
  clearInterval(progressTimers.get(id))
  progressTimers.delete(id)
}

function typeClasses(type: Toast['type']): string {
  const classes = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  }
  return classes[type]
}

function iconClasses(type: Toast['type']): string {
  const classes = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  }
  return classes[type]
}

function getIcon(type: Toast['type']): string {
  const icons = {
    success: 'CheckCircleIcon',
    error: 'XCircleIcon',
    warning: 'ExclamationTriangleIcon',
    info: 'InformationCircleIcon',
  }
  return icons[type]
}

// Icon components (inline SVGs)
const CheckCircleIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
}

const XCircleIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
}

const ExclamationTriangleIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
}

const InformationCircleIcon = {
  template: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
}
</script>

<style scoped>
@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(100%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateY(0);
  }
}
.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}

.toast-move {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.toast-leave-active {
  position: absolute;
  width: 100%;
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>