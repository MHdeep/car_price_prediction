<template>
  <div class="w-full" role="progressbar" :aria-valuenow="percentage" aria-valuemin="0" aria-valuemax="100" :aria-label="label">
    <div class="flex justify-between text-xs text-gray-500 mb-1.5">
      <span>{{ label }}</span>
      <span>{{ filled }} از {{ total }}</span>
    </div>
    <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-300 ease-out motion-reduce:transition-none"
        :class="colorClasses"
        :style="{ width: `${percentage}%` }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  filled: number
  total: number
  label?: string
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

const props = withDefaults(defineProps<Props>(), {
  label: 'تکمیل فرم',
  color: 'primary',
})

const percentage = computed(() => {
  if (props.total === 0) return 0
  return Math.round((props.filled / props.total) * 100)
})

const colorClasses = computed(() => {
  const colors = {
    primary: 'bg-gray-900',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
  }
  return colors[props.color]
})
</script>