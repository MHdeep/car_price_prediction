import { reactive, readonly, ref } from 'vue'
import type { FormField, ValidationError } from '~/types'

/**
 * Form Composable - Reusable form handling with validation
 */
export const useForm = <T extends Record<string, unknown>>(initialValues: T) => {
  // Use reactive for values to enable v-model binding
  const values = reactive<T>({ ...initialValues })
  const errors = ref<Record<string, string>>({})
  const touched = ref<Record<string, boolean>>({})
  const isSubmitting = ref(false)
  const submitCount = ref(0)

  // Validation rules
  const rules: Record<string, (value: unknown) => string | null> = {}

  // Set a field value
  const setFieldValue = (field: keyof T, value: unknown) => {
    ;(values as Record<string, unknown>)[field as string] = value
    // Clear error when user types
    if (errors.value[field as string]) {
      errors.value = { ...errors.value, [field]: '' }
    }
  }

  // Set field touched
  const setFieldTouched = (field: keyof T, isTouched = true) => {
    touched.value = { ...touched.value, [field]: isTouched }
  }

  // Validate a single field
  const validateField = (field: keyof T, value?: unknown): string | null => {
    const rule = rules[field as string]
    if (!rule) return null

    const fieldValue = value ?? values[field]
    return rule(fieldValue)
  }

  // Validate all fields
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    for (const field of Object.keys(values) as (keyof T)[]) {
      const error = validateField(field)
      if (error) {
        newErrors[field as string] = error
        isValid = false
      }
    }

    errors.value = newErrors
    return isValid
  }

  // Add validation rule
  const addRule = (field: keyof T, rule: (value: unknown) => string | null) => {
    rules[field as string] = rule
  }

  // Add multiple rules for a field (first error wins)
  const addRules = (field: keyof T, fieldRules: ((value: unknown) => string | null)[]) => {
    rules[field as string] = (value) => {
      for (const rule of fieldRules) {
        const error = rule(value)
        if (error) return error
      }
      return null
    }
  }

  // Reset form
  const reset = (newValues?: Partial<T>) => {
    Object.assign(values, { ...initialValues, ...newValues })
    errors.value = {}
    touched.value = {}
    isSubmitting.value = false
    submitCount.value = 0
  }

  // Handle submit
  const handleSubmit = async (onSubmit: (values: T) => Promise<void>): Promise<void> => {
    // Mark all fields as touched
    for (const field of Object.keys(values) as (keyof T)[]) {
      touched.value[field as string] = true
    }

    if (!validate()) {
      return
    }

    isSubmitting.value = true
    submitCount.value += 1

    try {
      await onSubmit(values as T)
    } finally {
      isSubmitting.value = false
    }
  }

  // Get field props for easy binding (v-model compatible)
  const getFieldProps = (field: keyof T) => ({
    get value() {
      return values[field]
    },
    set value(val: unknown) {
      setFieldValue(field, val)
    },
    error: errors.value[field as string] || undefined,
    touched: touched.value[field as string] || false,
    onInput: (e: Event) => setFieldValue(field, (e.target as HTMLInputElement).value),
    onChange: (value: unknown) => setFieldValue(field, value),
    onBlur: () => setFieldTouched(field, true),
  })

  return {
    // Don't use readonly for values - it breaks v-model binding
    // The reactive object allows direct property access and mutation
    values,
    errors: readonly(errors),
    touched: readonly(touched),
    isSubmitting: readonly(isSubmitting),
    submitCount: readonly(submitCount),
    setFieldValue,
    setFieldTouched,
    validateField,
    validate,
    addRule,
    addRules,
    reset,
    handleSubmit,
    getFieldProps,
  }
}

// Validation helpers
export const validation = {
  required: (message = 'این فیلد الزامی است') => (value: unknown): string | null => {
    if (value === undefined || value === null || value === '') return message
    if (typeof value === 'string' && value.trim() === '') return message
    return null
  },

  email: (message = 'فرمت ایمیل نامعتبر است') => (value: unknown): string | null => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value as string) ? null : message
  },

  minLength: (min: number, message?: string) => (value: unknown): string | null => {
    if (!value) return null
    const str = String(value)
    return str.length >= min ? null : message || `حداقل ${min} کاراکتر وارد کنید`
  },

  maxLength: (max: number, message?: string) => (value: unknown): string | null => {
    if (!value) return null
    const str = String(value)
    return str.length <= max ? null : message || `حداکثر ${max} کاراکتر مجاز است`
  },

  pattern: (regex: RegExp, message = 'فرمت نامعتبر است') => (value: unknown): string | null => {
    if (!value) return null
    return regex.test(value as string) ? null : message
  },

  password: (message = 'رمز عبور باید حداقل ۸ کاراکتر باشد') => (value: unknown): string | null => {
    if (!value) return null
    const str = String(value)
    return str.length >= 8 ? null : message
  },
}