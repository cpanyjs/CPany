<template>
  <div class="flex justify-center">
    <c-button padding="p-2" @click="prePage" :disable="current <= first"
      ><icon-left></icon-left
    ></c-button>
    <c-button
      padding="p-2"
      class="ml-2"
      @click="nextPage"
      :disable="current + 1 >= last"
      ><icon-right></icon-right
    ></c-button>
  </div>
</template>

<script setup lang="ts">
import IconLeft from 'virtual:vite-icons/mdi/chevron-left';
import IconRight from 'virtual:vite-icons/mdi/chevron-right';

defineProps<{
  current: number;
  first: number;
  last: number;
  nextPage: () => void;
  prePage: () => void;
}>();
</script>
