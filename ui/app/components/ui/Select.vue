<template>
  <div class="w-full" :class="{ 'relative': true }">
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-700 mb-1.5">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1" aria-hidden="true">*</span>
    </label>

    <div class="relative" ref="root">
      <!-- Hidden native select for form submission -->
      <select
        :id="id"
        :name="name"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        class="absolute opacity-0 w-full h-full z-10 cursor-pointer"
        @change="handleNativeChange"
        aria-hidden="true"
        tabindex="-1"
      >
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <!-- Custom trigger button -->
      <button
        type="button"
        :id="id"
        :aria-expanded="open"
        :aria-haspopup="listbox"
        :aria-controls="listId"
        :aria-activedescendant="open && filteredOptions.length ? `${listId}-${activeIndex}` : undefined"
        :disabled="disabled"
        :class="triggerClasses"
        @click="toggleList"
        @keydown="handleTriggerKeydown"
        ref="triggerButton"
      >
        <span class="flex-1 text-start truncate pr-10">
          <span v-if="modelValue" class="text-gray-900">
            {{ getSelectedLabel() }}
          </span>
          <span v-else class="text-gray-400">{{ placeholder }}</span>
        </span>

        <!-- Chevron icon -->
        <svg
          class="absolute inset-y-0 end-3 w-5 h-5 text-gray-400 transition-transform duration-200 pointer-events-none"
          :class="{ 'rotate-180': open }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>

        <!-- Clear button -->
        <button
          v-if="clearable && modelValue && !disabled"
          type="button"
          class="absolute inset-y-0 start-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          @click.stop.prevent="clear"
          aria-label="پاک کردن انتخاب"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </button>

      <!-- Options dropdown -->
      <Transition name="select">
        <div
          v-if="open"
          :id="listId"
          role="listbox"
          class="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg py-1"
          ref="listbox"
        >
          <div v-if="filteredOptions.length === 0" class="px-3 py-3 text-sm text-gray-400 text-center">
            {{ noResultsText }}
          </div>
          <ul v-else class="max-h-60 overflow-auto" role="listbox">
            <li
              v-for="(option, index) in filteredOptions"
              :key="option.value"
              :id="`${listId}-${index}`"
              role="option"
              :aria-selected="option.value === modelValue"
              class="flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer"
              :class="[
                index === activeIndex ? 'bg-gray-100' : '',
                option.value === modelValue ? 'font-semibold text-gray-900' : 'text-gray-700',
                option.disabled ? 'opacity-50 cursor-not-allowed' : '',
              ]"
              @mousedown.prevent="selectOption(option.value)"
              @mousemove="activeIndex = index"
            >
              <span>{{ option.label }}</span>
              <svg
                v-if="option.value === modelValue"
                class="w-4 h-4 shrink-0 text-gray-900"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </li>
          </ul>
        </div>
      </Transition>
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
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

interface Option {
  value: string
  label: string
  disabled?: boolean
}

interface Props {
  modelValue: string
  id: string
  name?: string
  label?: string
  options: Option[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  error?: string
  helper?: string
  clearable?: boolean
  noResultsText?: string
  searchable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => [],
  placeholder: 'انتخاب کنید',
  disabled: false,
  required: false,
  clearable: false,
  noResultsText: 'موردی یافت نشد',
  searchable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const root = ref<HTMLElement | null>(null)
const triggerButton = ref<HTMLButtonElement | null>(null)
const listbox = ref<HTMLDivElement | null>(null)
const open = ref(false)
const activeIndex = ref(0)
const searchQuery = ref('')

const listId = computed(() => `${props.id}-listbox`)

const filteredOptions = computed(() => {
  if (!props.searchable || !searchQuery.value.trim()) {
    return props.options
  }
  const query = props.searchable ? normalizeString(searchQuery.value) : ''
  return props.options.filter(opt =>
    normalizeString(opt.label).includes(query)
  )
})

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[‌‏]/g, '')
    .replace(/[۰-۹٠-٩]/g, (d) => {
      const c = d.charCodeAt(0)
      return String(c >= 0x06f0 ? c - 0x06f0 : c - 0x0660)
    })
    .replace(/\s+/g, ' ')
    .trim()
}

function getSelectedLabel(): string {
  const option = props.options.find(o => o.value === props.modelValue)
  return option?.label || ''
}

const triggerClasses = computed(() => {
  const base = 'w-full px-3 py-2.5 text-sm border rounded-lg bg-white text-start transition-colors'
  const states = [
    props.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : '',
    props.error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500/20'
      : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:ring-gray-900/20',
  ]
  return `${base} ${states.filter(Boolean).join(' ')} focus:outline-none focus:ring-2`
})

function toggleList() {
  if (props.disabled) return
  open.value = !open.value
  if (open.value) {
    searchQuery.value = ''
    activeIndex.value = filteredOptions.value.findIndex(o => o.value === props.modelValue)
    if (activeIndex.value < 0) activeIndex.value = 0
    nextTick(() => scrollToActive())
  }
}

function closeList() {
  open.value = false
  searchQuery.value = ''
}

function selectOption(value: string) {
  const option = props.options.find(o => o.value === value)
  if (option?.disabled) return

  emit('update:modelValue', value)
  emit('change', value)
  closeList()
  triggerButton.value?.focus()
}

function clear() {
  emit('update:modelValue', '')
  emit('change', '')
  searchQuery.value = ''
}

function handleNativeChange(e: Event) {
  const value = (e.target as HTMLSelectElement).value
  emit('update:modelValue', value)
  emit('change', value)
}

function handleTriggerKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      if (!open.value) {
        open.value = true
        activeIndex.value = 0
        nextTick(() => scrollToActive())
      } else {
        moveActive(1)
      }
      break
    case 'ArrowUp':
      e.preventDefault()
      if (open.value) {
        moveActive(-1)
      }
      break
    case 'Enter':
      if (open.value) {
        e.preventDefault()
        const option = filteredOptions.value[activeIndex.value]
        if (option && !option.disabled) {
          selectOption(option.value)
        }
      }
      break
    case 'Escape':
      if (open.value) {
        e.preventDefault()
        closeList()
      }
      break
    case 'Tab':
      closeList()
      break
    case 'Home':
      if (open.value) {
        e.preventDefault()
        activeIndex.value = 0
        scrollToActive()
      }
      break
    case 'End':
      if (open.value) {
        e.preventDefault()
        activeIndex.value = filteredOptions.value.length - 1
        scrollToActive()
      }
      break
  }
}

function moveActive(direction: number) {
  const length = filteredOptions.value.length
  if (!length) return

  let newIndex = activeIndex.value + direction
  // Skip disabled options
  while (newIndex >= 0 && newIndex < length && filteredOptions.value[newIndex]?.disabled) {
    newIndex += direction
  }
  newIndex = Math.max(0, Math.min(newIndex, length - 1))
  activeIndex.value = newIndex
  scrollToActive()
}

function scrollToActive() {
  nextTick(() => {
    const element = document.getElementById(`${listId.value}-${activeIndex.value}`)
    element?.scrollIntoView({ block: 'nearest' })
  })
}

function onOutsideClick(e: PointerEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) {
    closeList()
  }
}

watch(open, (val) => {
  if (!val) {
    activeIndex.value = 0
    searchQuery.value = ''
  }
})

watch(filteredOptions, () => {
  if (activeIndex.value >= filteredOptions.value.length) {
    activeIndex.value = filteredOptions.value.length - 1
  }
})

onMounted(() => document.addEventListener('pointerdown', onOutsideClick))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onOutsideClick))
</script>

<style scoped>
.select-enter-active,
.select-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.select-enter-from,
.select-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>