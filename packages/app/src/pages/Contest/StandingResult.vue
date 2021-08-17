<template>
  <template v-if="result">
    <div v-if="result.verdict === Verdict.OK">
      <div class="text-center font-bold text-green-500">
        <span>+</span>
        <span v-if="result.dirty">{{ result.dirty }}</span>
      </div>
      <div class="text-sm text-gray-400">
        <span>{{ toNumDuration(result.relativeTime) }}</span>
      </div>
    </div>
    <div v-else>
      <div class="text-center font-bold text-red-500">
        <span>-</span>
        <span>{{ result.dirty ?? 1 }}</span>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import type { IContestSubmission } from '@cpany/types';
import { Verdict } from '@cpany/types';

defineProps<{ result?: IContestSubmission }>();

function toNumDuration(seconds: number) {
  function alignNumber(value: number) {
    return (value < 10 ? '0' : '') + value;
  }
  const hour = Math.floor(seconds / 3600);
  const minute = Math.floor((seconds % 3600) / 60);
  return `${hour}:${alignNumber(minute)}`;
}
</script>
