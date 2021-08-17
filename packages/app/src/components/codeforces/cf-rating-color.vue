<template>
  <span :class="['cf-handle', color]">
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { isDef } from '@/utils';

const props = defineProps<{ rating?: number; rank?: string }>();
const { rating, rank } = toRefs(props);

const color = computed(() => {
  const rk = rank?.value;
  if (isDef(rk)) {
    return rk.replace(/ /g, '-');
  }
  const rt = rating?.value;
  if (!isDef(rt)) return null;
  if (rt < 1200) return 'newbie';
  if (rt < 1400) return 'pupil';
  if (rt < 1600) return 'specialist';
  if (rt < 1900) return 'expert';
  if (rt < 2100) return 'candidate-master';
  if (rt < 2400) return 'master';
  return 'master';
});
</script>
