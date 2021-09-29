<template>
  <div>
    <h2 class="mb-4">{{ contest.name }}</h2>
    <div class="info-box border-left">
      <p>
        时间：{{ toDate(contest.startTime).value }} 至
        {{ toDate(contest.startTime + contest.duration).value }}
      </p>
      <p>时长：{{ toDuration(contest.duration).value }}</p>
      <p>人数：{{ contest.participantNumber }} 人</p>
      <p v-if="contest.contestUrl || contest.standingsUrl">
        <a :href="contest.contestUrl" target="_blank">比赛主页</a>
        <a :href="contest.standingsUrl" target="_blank" class="ml-2">完整榜单</a>
      </p>
    </div>
    <contest-standings :contest="contest"></contest-standings>
  </div>
</template>

<script setup lang="ts">
import type { IContest } from '@cpany/types';

import { toDate, toDuration } from '@/utils';
import ContestStandings from './ContestStandings.vue';

defineProps<{ contest: IContest }>();
</script>
