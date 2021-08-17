<template>
  <template v-if="isDef(author.teamName)">
    <div>{{ author.teamName }}</div>
    <div class="space-left">
      <user-link
        v-for="(user, index) in author.members"
        :class="index > 0 && 'ml-2'"
        :key="user"
        :name="user"
      ></user-link>
    </div>
  </template>
  <span v-else>{{ author.members[0] }}</span>
</template>

<script setup lang="ts">
import type { IAuthor } from '@cpany/types';
import { isDef } from '@/utils';
import UserLink from '@/components/user-link.vue';

defineProps<{ author: IAuthor }>();
</script>
