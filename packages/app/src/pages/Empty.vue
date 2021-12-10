<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { onUnmounted } from 'vue';

const route = useRoute();

const router = useRouter();
const returnHome = () => router.replace({ name: 'Home' });

const timer = setTimeout(returnHome, 3000);
onUnmounted(() => clearTimeout(timer));
</script>

<template>
  <div class="divide-y">
    <h2 class="mb-2">错误</h2>
    <p class="pt-2">当前页面 <router-link :to="{ name: 'Home' }">{{ route.path }}</router-link> 不存在</p>
  </div>
</template>
