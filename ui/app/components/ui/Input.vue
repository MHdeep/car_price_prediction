<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1" aria-hidden="true">*</span>
    </label>

    <div class="relative">
      <input
        :id="id"
        :type="type"
        :name="name"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :readonly="readonly"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${id}-error` : undefined"
        :class="inputClasses"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur', $event)"
        @focus="$emit('focus', $event)"
        @keydown="$emit('keydown', $event)"
      />

      <!-- Clear button -->
      <button
        v-if="clearable && modelValue && !disabled && !readonly"
        type="button"
        class="absolute inset-y-0 end-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        @mousedown.prevent="clear"
        @click.stop="clear"
        aria-label="پاک کردن"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Password toggle -->
      <button
        v-if="type === 'password' && !disabled"
        type="button"
        class="absolute inset-y-0 end-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        @click="togglePassword"
        :aria-label="showPassword ? 'مخفی کردن رمز' : 'نمایش رمز'"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            v-if="showPassword"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
      </button>
    </div>

    <!-- Error message -->
    <p v-if="error" :id="`${id}-error`" class="mt-1.5 text-sm text-red-600" role="alert">
      {{ error }}
    </p>

    <!-- Helper text -->
    <p v-else-if="helper" class="mt-1.5 text-sm text-gray-500">
      {{ helper }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string
  id: string
  name?: string
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  disabled?: boolean
  required?: boolean
  readonly?: boolean
  error?: string
  helper?: string
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'text',
  disabled: false,
  required: false,
  readonly: false,
  clearable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  keydown: [event: KeyboardEvent]
}>()

const showPassword = ref(false)

const inputClasses = computed(() => {
  const base = 'w-full px-3 py-2.5 text-sm border rounded-lg bg-white transition-colors'
  const states = [
    props.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '',
    props.readonly ? 'bg-gray-50' : '',
    props.error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500/20'
      : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-gray-900/20',
  ]

  // Padding for clear button / password toggle
  const padding = (props.clearable || props.type === 'password') ? 'pr-10' : ''

  return `${base} ${states.filter(Boolean).join(' ')} ${padding} focus:outline-none focus:ring-2`
})

function clear() {
  emit('update:modelValue', '')
}

function togglePassword() {
  showPassword.value = !showPassword.value
}
</script>