<template>
  <template v-if="isDef(author.teamName)">
    <user-link :name="author.teamName"></user-link>
    <span class="space-left">
      <a
        v-for="(handle, index) in author.members"
        :key="index"
        class="ml-2 font-bold"
        :href="`https://codeforces.com/profile/${handle}`"
        target="_blank"
      >
        <at-rating-color :rating="findHandleRating(handle)">{{ handle }}</at-rating-color>
      </a>
    </span>
  </template>
  <span v-else>{{ author.members[0] }}</span>
</template>

<script setup lang="ts">
import type { IAuthor } from '@cpany/types';
import { isDef } from '@/utils';
import UserLink from '@/components/user-link.vue';
import { AtRatingColor } from '@/components/atcoder';
import { findHandleRating } from '@/atHandles';

defineProps<{ author: IAuthor }>();
</script>
