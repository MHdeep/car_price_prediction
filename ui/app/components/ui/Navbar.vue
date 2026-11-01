<template>
  <nav
    class="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm"
    :class="{ 'shadow-sm': scrolled }"
    dir="rtl"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2" aria-label="صفحه اصلی">
          <svg
            class="w-8 h-8 text-gray-900"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 19V6M3 14L12 3l9 11M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span class="text-xl font-bold text-gray-900">{{ appName }}</span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex md:items-center md:gap-6">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors relative py-2"
            :class="{ 'text-gray-900': isActive(link.to) }"
          >
            {{ link.label }}
            <span
              v-if="isActive(link.to)"
              class="absolute bottom-0 right-0 left-0 h-0.5 bg-gray-900 rounded-full"
            />
          </NuxtLink>

          <!-- Auth buttons -->
          <div class="flex items-center gap-3 ml-4 border-r border-gray-200 pr-4">
            <NuxtLink
              v-if="!isAuthenticated"
              to="/login"
              class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
            >
              ورود
            </NuxtLink>
            <NuxtLink
              v-if="!isAuthenticated"
              to="/signup"
              class="text-sm font-medium text-white bg-gray-900 hover:bg-gray-700 rounded-lg px-4 py-2 transition-colors"
            >
              ثبت نام
            </NuxtLink>

            <div v-else class="flex items-center gap-3">
              <span class="text-sm text-gray-600">{{ user?.name }}</span>
              <UIButton variant="ghost" size="sm" @click="handleLogout">
                خروج
              </UIButton>
            </div>
          </div>
        </div>

        <!-- Mobile menu button -->
        <button
          class="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          @click="mobileMenuOpen = !mobileMenuOpen"
          :aria-expanded="mobileMenuOpen"
          aria-controls="mobile-menu"
          aria-label="منو"
        >
          <svg
            v-if="!mobileMenuOpen"
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg
            v-else
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <Transition name="slide">
      <div
        v-show="mobileMenuOpen"
        id="mobile-menu"
        class="md:hidden border-t border-gray-200 bg-white animate-slide-down"
      >
        <div class="px-4 py-4 space-y-2">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            :class="{ 'bg-gray-50 text-gray-900': isActive(link.to) }"
            @click="mobileMenuOpen = false"
          >
            {{ link.label }}
          </NuxtLink>

          <div class="pt-4 border-t border-gray-200 space-y-2">
            <NuxtLink
              v-if="!isAuthenticated"
              to="/login"
              class="block px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              @click="mobileMenuOpen = false"
            >
              ورود
            </NuxtLink>
            <NuxtLink
              v-if="!isAuthenticated"
              to="/signup"
              class="block px-3 py-2 rounded-lg text-base font-medium text-white bg-gray-900 hover:bg-gray-700 transition-colors"
              @click="mobileMenuOpen = false"
            >
              ثبت نام
            </NuxtLink>

            <div v-else class="flex items-center gap-3 px-3 py-2">
              <span class="text-base text-gray-600">{{ user?.name }}</span>
              <UIButton variant="ghost" size="sm" class="flex-1" @click="handleLogout">
                خروج
              </UIButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'
import UIButton from '~/components/ui/Button.vue'

const { isAuthenticated, user, logout } = useAuth()
const toast = useToast()
const router = useRouter()
const route = useRoute()

const appName = useRuntimeConfig().public.appName

const scrolled = ref(false)
const mobileMenuOpen = ref(false)

const navLinks = [
  { label: 'خانه', to: '/' },
  { label: 'پیش‌بینی قیمت', to: '/predict' },
]

function isActive(path: string): boolean {
  return useRoute().path === path || (path !== '/' && useRoute().path.startsWith(path))
}

async function handleLogout() {
  await logout()
  toast.success('با موفقیت خارج شدید')
  mobileMenuOpen.value = false
}

// Scroll effect
if (import.meta.client) {
  const handleScroll = () => {
    scrolled.value = window.scrollY > 10
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
  onBeforeUnmount(() => window.removeEventListener('scroll', handleScroll))
}
</script>

<style scoped>
@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-down {
  animation: slide-down 0.2s ease-out;
}

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
.slide-leave-active {
  position: absolute;
  width: 100%;
}
</style>