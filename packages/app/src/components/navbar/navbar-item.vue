<template>
  <component :is="tag" class="navbar-item">
    <slot></slot>
  </component>
</template>

<script setup lang="ts">
defineProps({
  tag: {
    type: String,
    default: 'a'
  }
});
</script>

<style>
a.navbar-item {
  @apply flex select-none cursor-pointer rounded;
  @apply px-[0.75rem] py-[0.5rem];
}

.navbar-menu a.navbar-item {
  @apply hover:(bg-gray-100 text-blue-500);
}
</style>
