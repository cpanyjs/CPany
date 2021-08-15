<template>
  <div v-if="user">
    <h2 class="mb-4">{{ user.name }}</h2>
  </div>
</template>

<script setup lang="ts">
import type { IUser } from '@cpany/types';

defineProps<{ user: IUser }>();
</script>
