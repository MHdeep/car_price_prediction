<template>
  <div class="min-h-screen bg-gray-50">
    <UINavbar />
    <main>
      <NuxtPage />
    </main>
    <UIToastContainer :toasts="toasts" @remove="removeToast" />
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import UINavbar from '~/components/ui/Navbar.vue'
import UIToastContainer from '~/components/ui/ToastContainer.vue'

const { toasts, remove } = useToast()

function removeToast(id: number) {
  remove(id)
}
</script>