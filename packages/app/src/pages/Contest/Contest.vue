<template>
  <div>
    <h2 class="mb-4">{{ contest.name }}</h2>
    <div
      class="
        rounded
        border-8 border-green-100
        bg-light-200
        md:(pl-4)
        <md:(pl-2)
        py-2
      "
      style="border-top: none; border-bottom: none; border-right: none"
    >
      <p>
        比赛时间：{{ toDate(contest.startTime).value }} 至
        {{ toDate(contest.startTime + contest.duration).value }}
      </p>
      <p>时长：{{ toDuration(contest.duration).value }}</p>
      <p>参与人数：{{ contest.participantNumber }} 人</p>
      <p v-if="contest.contestUrl || contest.standingsUrl">
        <a :href="contest.contestUrl" target="_blank">比赛主页</a>
        <a :href="contest.standingsUrl" target="_blank" class="ml-2"
          >完整榜单</a
        >
      </p>
    </div>
    <div v-if="contest.standings" class="mt-4 box">
      <div v-for="standing in contest.standings" class="my-1">
        <span class="font-bold inline-block w-8 text-center select-none">{{
          standing.rank
        }}</span>
        <span>{{
          standing.author.teamName ?? standing.author.members[0]
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IContest } from '@cpany/types';

import { toDate, toDuration } from '../../utils';

const props = defineProps<{ contest: IContest }>();
</script>
