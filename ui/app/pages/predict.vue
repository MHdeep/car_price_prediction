<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <UICard class="w-full max-w-2xl mx-auto" padding="lg">
      <header class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">پیش‌بینی قیمت خودرو</h1>
        <p class="mt-2 text-gray-500">مشخصات خودرو را انتخاب کنید تا قیمت تقریبی محاسبه شود</p>
      </header>

      <!-- Progress Bar -->
      <UIProgressBar
        v-if="!predictionResult"
        :filled="filledCount"
        :total="allFields.length"
        label="تکمیل فرم"
        color="primary"
        class="mb-6"
      />

      <form @submit.prevent="handleSubmit" class="space-y-6" v-if="!predictionResult">
        <fieldset
          v-for="group in formGroups"
          :key="group.title"
          class="space-y-4"
        >
          <legend class="text-sm font-semibold text-gray-900">{{ group.title }}</legend>
          <div class="grid sm:grid-cols-2 gap-4">
            <UIFormField
              v-for="field in group.fields"
              :key="field.key"
              :label="field.label"
              :id="field.key"
              :error="errors[field.key]"
              :required="field.required"
            >
              <template #default="{ error, id, disabled }">
                <UISelect
                  v-model="form[field.key]"
                  :id="id"
                  :name="field.key"
                  :options="getOptions(field.key)"
                  :placeholder="filtersLoading ? 'در حال بارگذاری...' : 'جستجو یا انتخاب کنید'"
                  :disabled="disabled || filtersLoading"
                  :error="error"
                  :searchable="true"
                  @change="() => {}"
                />
              </template>
            </UIFormField>
          </div>
        </fieldset>

        <UIAlert
          v-if="serverError"
          type="error"
          :message="serverError"
          dismissible
          @dismiss="serverError = null"
        />

        <div class="flex gap-3 pt-4 border-t border-gray-200">
          <UIButton
            type="submit"
            variant="primary"
            size="lg"
            full-width
            :loading="predictionLoading"
            :disabled="predictionLoading || filtersLoading"
          >
            پیش‌بینی قیمت
          </UIButton>
          <UIButton
            type="button"
            variant="outline"
            size="lg"
            :disabled="filledCount === 0 || predictionLoading"
            @click="resetForm"
          >
            پاک کردن
          </UIButton>
        </div>
      </form>

      <!-- Result -->
      <div v-else class="text-center py-8 animate-fade-in">
        <UIAlert
          type="success"
          title="پیش‌بینی انجام شد"
          :message="`قیمت تقریبی: ${formatPriceWithUnit(predictionResult)}`"
        />

        <p class="mt-4 text-sm text-gray-500 max-w-xs mx-auto">
          این عدد یک برآورد است. قیمت نهایی به شرایط بازار و بازدید حضوری هم بستگی دارد.
        </p>

        <div class="mt-6 flex gap-3 justify-center">
          <UIButton
            variant="outline"
            size="lg"
            @click="resetPrediction"
          >
            پیش‌بینی جدید
          </UIButton>
        </div>
      </div>
    </UICard>
  </div>
</template>

<script setup lang="ts">
import { useCar } from '~/composables/useCar'
import { useToast } from '~/composables/useToast'
import { onMounted, computed, ref } from 'vue'
import UICard from '~/components/ui/Card.vue'
import UIProgressBar from '~/components/ui/ProgressBar.vue'
import UIFormField from '~/components/ui/FormField.vue'
import UISelect from '~/components/ui/Select.vue'
import UIAlert from '~/components/ui/Alert.vue'
import UIButton from '~/components/ui/Button.vue'

const car = useCar()
const toast = useToast()

// Local form state
const form = ref(car.createInitialForm())
const errors = ref<Record<string, string>>({})
const serverError = ref<string | null>(null)

// Computed from car composable
const formGroups = car.formGroups
const allFields = car.allFields
const filtersLoading = car.filtersLoading
const predictionLoading = car.predictionLoading
const predictionResult = car.predictionResult
const formatPriceWithUnit = car.formatPriceWithUnit

const filledCount = computed(() =>
  allFields.value.filter(f => form.value[f.key as keyof typeof form.value]).length
)

function getOptions(key: string): { value: string; label: string }[] {
  const options = car.getOptions(key as keyof typeof car.filters.value)
  return options.map(o => ({ value: o, label: o }))
}

function validateForm(): boolean {
  errors.value = {}
  let valid = true
  for (const field of allFields.value) {
    if (field.required && !form.value[field.key as keyof typeof form.value]) {
      errors.value[field.key] = `${field.label} را انتخاب کنید`
      valid = false
    }
  }
  return valid
}

async function handleSubmit() {
  serverError.value = null
  if (!validateForm()) return

  const price = await car.predict(form.value)
  if (!price) {
    serverError.value = 'پیش‌بینی ناموفق بود، لطفاً دوباره تلاش کنید'
  }
}

function resetForm() {
  form.value = car.createInitialForm()
  errors.value = {}
  serverError.value = null
  car.resetPrediction()
}

function resetPrediction() {
  resetForm()
}

onMounted(() => {
  car.loadFilters()
})
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>