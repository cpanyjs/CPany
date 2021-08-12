<template>
  <div>
    <div
      v-for="user in users"
      :key="user.name"
      class="p-2 border border-gray-300 rounded mb-2"
    >
      <p>{{ user.name }}</p>
      <p>
        <span>账号：</span>
        <span v-for="handle in user.handles" :key="handle.handle">{{
          handle.handle
        }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { users } from '../overview';
</script>

<style></style>
