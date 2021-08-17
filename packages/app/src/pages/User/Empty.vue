<template>
  <div class="divide-y">
    <h2 class="mb-2">错误</h2>
    <p class="pt-2">未找到用户 {{ id }}</p>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { onUnmounted, toRefs } from 'vue';

const route = useRoute();
const { id } = toRefs(route.params);

const router = useRouter();
const returnHome = () => router.replace({ name: 'Home' });

const timer = setTimeout(returnHome, 3000);
onUnmounted(() => clearTimeout(timer));
</script>
