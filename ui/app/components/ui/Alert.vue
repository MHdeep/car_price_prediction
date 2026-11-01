<template>
  <div
    :class="[
      'flex items-start gap-3 p-4 rounded-xl border',
      typeClasses,
    ]"
    role="alert"
    :aria-live="type === 'error' ? 'assertive' : 'polite'"
  >
    <div class="flex-shrink-0 mt-0.5" :class="iconClasses">
      <component :is="getIcon(type)" class="w-5 h-5" />
    </div>

    <div class="flex-1 min-w-0">
      <h4 v-if="title" class="font-medium text-sm">{{ title }}</h4>
      <div class="text-sm leading-relaxed">
        <slot>{{ message }}</slot>
      </div>
    </div>

    <button
      v-if="dismissible"
      type="button"
      class="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors"
      @click="$emit('dismiss')"
      :aria-label="`بستن هشدار`"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  type: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message?: string
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dismissible: false,
})

const emit = defineEmits<{
  dismiss: []
}>()

const typeClasses = computed(() => {
  const classes = {
    success: 'border-green-200 bg-green-50 text-green-800',
    error: 'border-red-200 bg-red-50 text-red-800',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
    info: 'border-blue-200 bg-blue-50 text-blue-800',
  }
  return classes[props.type]
})

const iconClasses = computed(() => {
  const classes = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  }
  return classes[props.type]
})

function getIcon(type: Props['type']): string {
  const icons = {
    success: 'CheckCircleIcon',
    error: 'XCircleIcon',
    warning: 'ExclamationTriangleIcon',
    info: 'InformationCircleIcon',
  }
  return icons[type]
}

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