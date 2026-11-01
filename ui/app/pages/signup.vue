<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
    <UICard class="w-full max-w-md" padding="lg">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">ساخت حساب کاربری</h1>
        <p class="mt-2 text-gray-500">برای پیش‌بینی قیمت خودرو ثبت نام کنید</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <UIFormField label="نام کامل" id="name" :error="errors.name" required>
          <template #default="{ error, id, disabled }">
            <UIInput
              v-model="form.values.name"
              :id="id"
              type="text"
              name="name"
              placeholder="نام و نام خانوادگی"
              autocomplete="name"
              :disabled="disabled || isSubmitting"
              :error="error"
              @keydown.enter="handleSubmit"
            />
          </template>
        </UIFormField>

        <UIFormField label="ایمیل" id="email" :error="errors.email" required>
          <template #default="{ error, id, disabled }">
            <UIInput
              v-model="form.values.email"
              :id="id"
              type="email"
              name="email"
              placeholder="example@email.com"
              autocomplete="email"
              :disabled="disabled || isSubmitting"
              :error="error"
              @keydown.enter="handleSubmit"
            />
          </template>
        </UIFormField>

        <UIFormField label="رمز عبور" id="password" :error="errors.password" required helper="حداقل ۸ کاراکتر">
          <template #default="{ error, id, disabled }">
            <UIInput
              v-model="form.values.password"
              :id="id"
              type="password"
              name="password"
              placeholder="••••••••"
              autocomplete="new-password"
              :disabled="disabled || isSubmitting"
              :error="error"
              @keydown.enter="handleSubmit"
            />
          </template>
        </UIFormField>

        <UIFormField label="تایید رمز عبور" id="password_confirm" :error="errors.password_confirm" required>
          <template #default="{ error, id, disabled }">
            <UIInput
              v-model="form.values.password_confirm"
              :id="id"
              type="password"
              name="password_confirm"
              placeholder="••••••••"
              autocomplete="new-password"
              :disabled="disabled || isSubmitting"
              :error="error"
              @keydown.enter="handleSubmit"
            />
          </template>
        </UIFormField>

        <UIAlert
          v-if="serverError"
          type="error"
          :message="serverError"
          dismissible
          @dismiss="serverError = null"
        />

        <div class="flex items-start gap-2">
          <input
            type="checkbox"
            v-model="termsAccepted"
            id="terms"
            class="mt-1 w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
            required
          />
          <label for="terms" class="text-sm text-gray-600">
            با <a href="#" class="text-gray-900 hover:underline">شرایط استفاده</a>
            و <a href="#" class="text-gray-900 hover:underline">حریم خصوصی</a>
            موافقم
          </label>
        </div>

        <UIButton
          type="submit"
          variant="primary"
          size="lg"
          full-width
          :loading="isSubmitting"
          :disabled="isSubmitting || !termsAccepted"
        >
          ثبت نام
        </UIButton>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          قبلاً ثبت نام کرده‌اید؟
          <NuxtLink to="/login" class="ml-1 font-medium text-gray-900 hover:underline">
            ورود
          </NuxtLink>
        </p>
      </div>
    </UICard>
  </div>
</template>

<script setup lang="ts">
import { useForm, validation } from '~/composables/useForm'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'
import { useRouter, useRoute } from 'vue-router'
import UICard from '~/components/ui/Card.vue'
import UIFormField from '~/components/ui/FormField.vue'
import UIInput from '~/components/ui/Input.vue'
import UIAlert from '~/components/ui/Alert.vue'
import UIButton from '~/components/ui/Button.vue'

const auth = useAuth()
const toast = useToast()
const router = useRouter()
const route = useRoute()

// Form setup
const form = useForm({
  name: '',
  email: '',
  password: '',
  password_confirm: '',
})

// Add validation rules
form.addRules('name', [validation.required('نام الزامی است'), validation.minLength(2)])
form.addRules('email', [validation.required(), validation.email()])
form.addRules('password', [validation.required(), validation.password()])
form.addRules('password_confirm', [
  validation.required('تایید رمز عبور الزامی است'),
  (value) => value === form.values.password ? null : 'رمزهای عبور یکسان نیستند',
])

const errors = computed(() => form.errors.value)
const isSubmitting = computed(() => form.isSubmitting.value)
const termsAccepted = ref(false)
const serverError = ref<string | null>(null)

// Redirect after signup
const redirect = route.query.redirect as string || '/'

async function handleSubmit() {
  serverError.value = null
  await form.handleSubmit(async (values) => {
    const result = await auth.register(values.name, values.email, values.password)
    if (result.success) {
      toast.success('ثبت نام موفقیت‌آمیز بود')
      await router.push(redirect)
    } else {
      serverError.value = result.message || 'ثبت نام ناموفق بود'
    }
  })
}

// Redirect if already authenticated
if (import.meta.client && auth.isAuthenticated.value) {
  router.push(redirect)
}
</script>