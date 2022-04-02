<template>
  <span :style="{ color }">
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import { isDef } from '@/utils';

const props = defineProps<{ color?: string; rating?: number }>();
const { rating, color: _color } = toRefs(props);

const color = computed(() => {
  if (isDef(_color?.value)) {
    return _color?.value;
  }
  const rt = rating?.value;
  if (!isDef(rt)) return '#b4b4b4';
  if (rt < 700) return '#b4b4b4';
  if (rt < 1200) return '#c177e7';
  if (rt < 1500) return '#5ea1f4';
  if (rt < 2200) return '#25bb9b';
  if (rt < 2800) return '#fc6';
  return 'red';
});
</script>
