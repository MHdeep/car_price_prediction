<template>
  <article
    :class="[
      'rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md',
      variantClasses,
      paddingClasses,
    ]"
  >
    <slot />
  </article>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'outlined' | 'elevated' | 'filled'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
})

const variantClasses = computed(() => {
  const variants = {
    default: 'border-gray-200',
    outlined: 'border-2 border-gray-300',
    elevated: 'border-none shadow-lg',
    filled: 'border-none bg-gray-50',
  }
  return variants[props.variant]
})

const paddingClasses = computed(() => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  return paddings[props.padding]
})
</script>