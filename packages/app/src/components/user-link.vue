<template>
  <router-link :to="`/user/${name}`">{{ name }}</router-link>
</template>

<script setup lang="ts">
defineProps<{ name: string }>();
</script>

<style></style>
