<template>
  <div>
    <h2 class="mb-4">{{ contest.name }}</h2>
    <div class="info-box border-left">
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
      <c-table :data="contest.standings">
        <template #columns="{ row }">
          <c-table-column label="#" align="center" width="4em">
            <span class="font-600">{{ row.rank }}</span>
          </c-table-column>
          <c-table-column label="名称">
            <span>{{
              row.author.teamName ? row.author.teamName : row.author.members[0]
            }}</span>
          </c-table-column>
          <c-table-column label="解决" align="center" width="4em">
            <span>{{ row.solved }}</span>
          </c-table-column>
          <c-table-column label="罚时" align="center" width="4em">
            <span>{{ toNumDuration(row.penalty).value }}</span>
          </c-table-column>
        </template>
      </c-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IContest } from '@cpany/types';

import { CTable, CTableColumn } from '@/components/table';
import { toDate, toNumDuration, toDuration } from '../../utils';

defineProps<{ contest: IContest }>();
</script>
