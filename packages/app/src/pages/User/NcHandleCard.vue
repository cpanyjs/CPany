<template>
  <p>
    <span class="font-600">牛客: </span>
    <a :href="nowcoder.handleUrl" target="_blank" :class="['font-bold']">{{
      nowcoder.nowcoder.name
    }}</a>
  </p>
  <p>
    <span class="font-600">提交: </span>
    <span>{{ nowcoder.submissions.length }}</span>
  </p>
  <p>
    <span class="font-600">通过: </span>
    <span>{{ nowcoder.submissions.filter(({ verdict }) => verdict === Verdict.OK).length }}</span>
  </p>
</template>

<script setup lang="ts">
import type { IHandleWithNowcoder } from '@cpany/types/nowcoder';

import { Verdict } from '@cpany/types';

defineProps<{ nowcoder: IHandleWithNowcoder }>();
</script>
