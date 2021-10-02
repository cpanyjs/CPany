<template>
  <template v-if="isDef(author.teamName)">
    <div>
      <span :class="teamUrl !== '' && 'cursor-pointer'" @click="handleClick">{{
        author.teamName
      }}</span>
    </div>
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
import { toRefs, computed } from 'vue';
import { isDef } from '@/utils';
import UserLink from '@/components/user-link.vue';

const props = defineProps<{ author: IAuthor }>();
const { author } = toRefs(props);

const teamUrl = computed(() => author?.value?.teamUrl ?? '');

const handleClick = () => {
  if (teamUrl.value !== '') {
    window.open(teamUrl.value, '_blank');
  }
};
</script>
