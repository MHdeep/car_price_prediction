<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1" aria-hidden="true">*</span>
    </label>

    <slot
      :error="error"
      :id="id"
      :disabled="disabled"
      :required="required"
    />

    <p v-if="error" :id="`${id}-error`" class="mt-1.5 text-sm text-red-600" role="alert">
      {{ error }}
    </p>

    <p v-else-if="helper" class="mt-1.5 text-sm text-gray-500">
      {{ helper }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  id: string
  error?: string
  helper?: string
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
})

defineSlots<{
  default: {
    error: string | undefined
    id: string
    disabled: boolean
    required: boolean
  }
}>()
</script>