<template>
  <template v-if="isDef(author.teamName)">
    <div>
      <a :href="author.teamUrl">
        <nc-rating-color :rating="findHandleRating(author.teamName)">{{
          author.teamName
        }}</nc-rating-color>
      </a>
    </div>
    <div class="space-left">
      <span v-for="(user, index) in author.members" :key="user" :class="index > 0 && 'ml-2'">
        <a
          :href="`https://ac.nowcoder.com/acm/contest/profile/${user}`"
          v-if="/^\d+$/.test(user)"
          >{{ user }}</a
        >
        <user-link v-else :name="user"></user-link>
      </span>
    </div>
  </template>
  <span v-else>{{ author.members[0] }}</span>
</template>

<script setup lang="ts">
import type { IAuthor } from '@cpany/types';
import { isDef } from '@/utils';
import UserLink from '@/components/user-link.vue';

import { NcRatingColor } from '@/components/nowcoder';
import { findHandleRating } from '@/ncHandles';

defineProps<{ author: IAuthor }>();
</script>
