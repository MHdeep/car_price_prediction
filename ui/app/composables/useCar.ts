import type { CarFilters, CarFormData, FormField, FormGroup } from '~/types'
import { useApi } from '~/composables/useApi'
import { useToast } from '~/composables/useToast'

/**
 * Car Composable - Car-specific logic: filters, form groups, prediction
 */
export const useCar = () => {
  const api = useApi()
  const toast = useToast()

  // State
  const filters = ref<CarFilters>({
    brand: [],
    gerbox: [],
    fuel: [],
    colors: [],
    motor_status: [],
    chassis_status: [],
    body_status: [],
    gerbox_status: [],
  })
  const filtersLoading = ref(false)
  const predictionResult = ref<number | null>(null)
  const predictionLoading = ref(false)

  // Form groups configuration
  const formGroups = computed<FormGroup[]>(() => [
    {
      title: 'مشخصات اصلی',
      fields: [
        { key: 'brand', label: 'برند', required: true },
        { key: 'gerbox', label: 'گیربکس', required: true },
        { key: 'fuel', label: 'نوع سوخت', required: true },
        { key: 'colors', label: 'رنگ', required: true },
      ],
    },
    {
      title: 'وضعیت فنی',
      fields: [
        { key: 'motor_status', label: 'وضعیت موتور', required: true },
        { key: 'chassis_status', label: 'وضعیت شاسی', required: true },
        { key: 'body_status', label: 'وضعیت بدنه', required: true },
        { key: 'gerbox_status', label: 'وضعیت گیربکس', required: true },
      ],
    },
  ])

  // Flattened fields for easy iteration
  const allFields = computed<FormField[]>(() =>
    formGroups.value.flatMap(g => g.fields)
  )

  // Load filter options from API
  async function loadFilters(): Promise<void> {
    filtersLoading.value = true
    try {
      const response = await api.getCarFilters()
      if (response.success && response.data) {
        filters.value = response.data
      } else {
        toast.error(response.message || 'بارگذاری فیلترها ناموفق بود')
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
    } finally {
      filtersLoading.value = false
    }
  }

  // Get options for a specific field
  function getOptions(fieldKey: keyof CarFilters): string[] {
    return filters.value[fieldKey] || []
  }

  // Create initial form data
  function createInitialForm(): CarFormData {
    return {
      brand: '',
      gerbox: '',
      fuel: '',
      colors: '',
      motor_status: '',
      chassis_status: '',
      body_status: '',
      gerbox_status: '',
    }
  }

  // Validate form data
  function validateForm(form: CarFormData): string[] {
    const errors: string[] = []
    for (const field of allFields.value) {
      if (field.required && !form[field.key as keyof CarFormData]) {
        errors.push(`${field.label} را انتخاب کنید`)
      }
    }
    return errors
  }

  // Submit prediction
  async function predict(form: CarFormData): Promise<number | null> {
    const errors = validateForm(form)
    if (errors.length > 0) {
      toast.error(errors[0])
      return null
    }

    predictionLoading.value = true
    predictionResult.value = null

    try {
      const response = await api.predictPrice(form)
      if (response.success && response.data) {
        const price = response.data.prediction
        predictionResult.value = price
        toast.success('پیش‌بینی با موفقیت انجام شد')
        return price
      } else {
        toast.error(response.message || 'پیش‌بینی ناموفق بود')
        return null
      }
    } catch {
      toast.error('خطا در ارتباط با سرور')
      return null
    } finally {
      predictionLoading.value = false
    }
  }

  // Reset prediction
  function resetPrediction(): void {
    predictionResult.value = null
  }

  // Format price for display (Persian numbers)
  function formatPrice(price: number): string {
    return new Intl.NumberFormat('fa-IR').format(Math.round(price))
  }

  // Format price with unit
  function formatPriceWithUnit(price: number): string {
    return `${formatPrice(price)} تومان`
  }

  return {
    // State
    filters: readonly(filters),
    filtersLoading: readonly(filtersLoading),
    predictionResult: readonly(predictionResult),
    predictionLoading: readonly(predictionLoading),
    formGroups: readonly(formGroups),
    allFields: readonly(allFields),

    // Methods
    loadFilters,
    getOptions,
    createInitialForm,
    validateForm,
    predict,
    resetPrediction,
    formatPrice,
    formatPriceWithUnit,
  }
}