<template>
  <p>
    <span class="font-600">洛谷: </span>
    <a :href="luogu.handleUrl" target="_blank" :class="['font-600', 'lg-' + luogu.luogu.color]">{{
      luogu.luogu.name
    }}</a>
  </p>
  <p v-if="!!luogu.luogu.ranking">
    <span class="font-600">Rank: </span>
    <span :class="['font-600', 'lg-' + luogu.luogu.color]">{{ luogu.luogu.ranking }}</span>
  </p>
  <p>
    <span class="font-600">提交: </span>
    <span>{{ luogu.submissions.length }}</span>
  </p>
  <p>
    <span class="font-600">通过: </span>
    <span>{{ luogu.submissions.filter(({ verdict }) => verdict === Verdict.OK).length }}</span>
  </p>
  <p v-if="!!luogu.luogu.slogan && luogu.luogu.slogan.length > 0">{{ luogu.luogu.slogan }}</p>
</template>

<script setup lang="ts">
import type { IHandleWithLuogu } from '@cpany/types/luogu';

import { Verdict } from '@cpany/types';

defineProps<{ luogu: IHandleWithLuogu }>();
</script>
