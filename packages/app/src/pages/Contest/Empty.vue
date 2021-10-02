<template>
  <div class="divide-y">
    <h2 class="mb-2">错误</h2>
    <p class="pt-2">未找到 ID 为 {{ id }} 的 {{ platform }} 比赛</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, toRefs } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { displayPlatform } from '@/utils';

const route = useRoute();
const { platform: _platform, id } = toRefs(route.params);

const platform = computed(() => {
  if (Array.isArray(_platform.value)) {
    return displayPlatform(_platform.value[0]);
  } else {
    return displayPlatform(_platform.value);
  }
});

const router = useRouter();
const returnHome = () => router.replace({ name: 'Home' });

const timer = setTimeout(returnHome, 3000);
onUnmounted(() => clearTimeout(timer));
</script>
