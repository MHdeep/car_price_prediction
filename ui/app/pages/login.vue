<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
    <UICard class="w-full max-w-md" padding="lg">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-gray-900">ورود به حساب کاربری</h1>
        <p class="mt-2 text-gray-500">برای پیش‌بینی قیمت خودرو وارد شوید</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
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

        <UIFormField label="رمز عبور" id="password" :error="errors.password" required>
          <template #default="{ error, id, disabled }">
            <UIInput
              v-model="form.values.password"
              :id="id"
              type="password"
              name="password"
              placeholder="••••••••"
              autocomplete="current-password"
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

        <div class="flex items-center justify-between">
          <label class="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              v-model="rememberMe"
              class="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
            />
            <span class="text-sm text-gray-600">مرا به یاد بسپار</span>
          </label>
        </div>

        <UIButton
          type="submit"
          variant="primary"
          size="lg"
          full-width
          :loading="isSubmitting"
          :disabled="isSubmitting"
        >
          ورود
        </UIButton>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          حساب کاربری ندارید؟
          <NuxtLink to="/signup" class="ml-1 font-medium text-gray-900 hover:underline">
            ثبت نام
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
  email: '',
  password: '',
  rememberMe: false,
})

// Add validation rules
form.addRules('email', [validation.required(), validation.email()])
form.addRules('password', [validation.required(), validation.password()])

const errors = computed(() => form.errors.value)
const isSubmitting = computed(() => form.isSubmitting.value)
const rememberMe = ref(false)
const serverError = ref<string | null>(null)

// Redirect after login
const redirect = route.query.redirect as string || '/'

async function handleSubmit() {
  serverError.value = null
  await form.handleSubmit(async (values) => {
    const result = await auth.login(values.email, values.password)
    if (result.success) {
      toast.success('ورود موفقیت‌آمیز بود')
      await router.push(redirect)
    } else {
      serverError.value = result.message || 'ورود ناموفق بود'
    }
  })
}

// Redirect if already authenticated
if (import.meta.client && auth.isAuthenticated.value) {
  router.push(redirect)
}
</script>