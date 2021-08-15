<template>
  <button
    :class="[
      'inline-flex',
      'justify-center',
      'items-center',
      'button',
      colorClass
    ]"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';

const props = defineProps<{
  primary?: boolean;
  info?: boolean;
  success?: boolean;
  warning?: boolean;
  danger?: boolean;
}>();

const { primary, info, success, warning, danger } = toRefs(props);

const colorClass = primary?.value
  ? 'is-primary'
  : info?.value
  ? 'is-info'
  : success?.value
  ? 'is-success'
  : warning?.value
  ? 'is-warning'
  : danger?.value
  ? 'is-danger'
  : undefined;
</script>

<style>
.button {
  @apply px-3 py-2;
  @apply rounded border border-1 border-[#dbdbdb] !outline-none;
  @apply cursor-pointer select-none;

  @apply hover:border-[#b5b5b5];
  @apply focus:shadow;
}

.button.is-success,
.button.is-primary {
  @apply border-transparent bg-[#48c78e] text-white;
  @apply hover:bg-[#3ec487];
  @apply focus:shadow-success;
}

.button.is-info {
  @apply border-transparent text-white bg-[#209cee];
  @apply hover:bg-[#1496ed];
  @apply focus:shadow-info;
}

.button.is-warning {
  @apply border-transparent bg-[#ffe08a];
  @apply hover:bg-[#ffdc7d];
  @apply focus:shadow-warning;
}

.button.is-danger {
  @apply border-transparent text-white bg-[#f14668];
  @apply hover:bg-[#f03a5f];
  @apply focus:shadow-danger;
}
</style>
