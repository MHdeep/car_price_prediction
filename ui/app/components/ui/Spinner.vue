<template>
  <div
    :class="[
      'inline-flex items-center justify-center',
      sizeClasses,
      colorClasses,
    ]"
    :role="role"
    :aria-label="ariaLabel"
  >
    <svg
      class="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      :viewBox="viewBox"
      :aria-hidden="ariaHidden"
    >
      <circle
        class="opacity-25"
        :cx="center"
        :cy="center"
        :r="radius"
        stroke="currentColor"
        :stroke-width="strokeWidth"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        :d="pathD"
      />
    </svg>
    <span v-if="label" class="sr-only">{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray' | 'inherit'
  label?: string
  role?: 'status' | 'alert'
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary',
  role: 'status',
})

const sizeClasses = computed(() => {
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  }
  return sizes[props.size]
})

const colorClasses = computed(() => {
  const colors = {
    primary: 'text-gray-900',
    white: 'text-white',
    gray: 'text-gray-400',
    inherit: 'text-current',
  }
  return colors[props.color]
})

const center = computed(() => {
  const centers = {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 16,
    xl: 20,
  }
  return centers[props.size]
})

const radius = computed(() => {
  const radii = {
    xs: 6,
    sm: 8,
    md: 10,
    lg: 14,
    xl: 18,
  }
  return radii[props.size]
})

const strokeWidth = computed(() => {
  const widths = {
    xs: 2,
    sm: 2.5,
    md: 3,
    lg: 3.5,
    xl: 4,
  }
  return widths[props.size]
})

const viewBox = computed(() => `0 0 ${center.value * 2} ${center.value * 2}`)

const pathD = computed(() => {
  const c = center.value
  const r = radius.value
  return `M${c} ${c - r}a${r} ${r} 0 01${r} ${r}V${c * 2}`
})

const ariaHidden = computed(() => props.role === 'alert' ? 'false' : 'true')
</script>