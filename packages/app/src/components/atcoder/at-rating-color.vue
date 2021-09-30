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
  if (!isDef(rt)) return null;
  if (rt < 400) return '#808080';
  if (rt < 800) return '#804000';
  if (rt < 1200) return '#008000';
  if (rt < 1600) return '#00C0C0';
  if (rt < 2000) return '#0000FF';
  if (rt < 2400) return '#C0C000';
  if (rt < 2800) return '#FF8000';
  return '#FF0000';
});
</script>
