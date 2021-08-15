<template>
  <div>
    <p class="text-gray-400 text-sm mb-1">{{ title }}</p>
    <p class="flex items-center py-2 text-xl">
      <slot class="text-2xl" name="prefix" />
      <span class="inline-block text-2xl ml-1"><slot name="default" /></span>
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string }>();
</script>
