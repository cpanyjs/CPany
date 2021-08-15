<template>
  <div>
    <h2 class="mb-4">所有比赛</h2>

    <c-table :data="displayContests">
      <template #columns="{ row, index }">
        <c-table-column label="#" center>
          <span class="font-600">{{ index + 1 }}</span>
        </c-table-column>
        <c-table-column label="比赛">
          <router-link :to="row.path">{{ row.name }}</router-link>
        </c-table-column>
        <c-table-column label="类型" center>
          <span>{{ displayType(row) }}</span>
        </c-table-column>
        <c-table-column label="时间" align="center" width="10em">
          <span>{{ toDate(row.startTime).value }}</span>
        </c-table-column>
        <c-table-column label="人数" align="center" width="5em">
          <div class="flex flex-1 items-center justify-center">
            <icon-account />&nbsp;<span>x {{ row.participantNumber }}</span>
          </div>
        </c-table-column>
      </template>
    </c-table>

    <div class="flex justify-center">
      <c-button @click="displayMore" success>↓ 浏览更多</c-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IContest } from '@cpany/types';
import IconAccount from 'virtual:vite-icons/mdi/account';
import { ref } from 'vue';

import { contests } from '@/contests';
import { CTable, CTableColumn } from '@/components/table';
import { recentContestsCount } from '@/overview';
import { toDate } from '@/utils';

const unit = recentContestsCount * 2;

const displayContests = ref(contests.slice(0, unit));

const displayMore = () => {
  const curLength = displayContests.value.length;
  displayContests.value.push(...contests.slice(curLength, curLength + unit));
};

const displayType = (contest: IContest) => {
  if (contest.type.startsWith('codeforces')) {
    if (/Round/.test(contest.name) || /Div/.test(contest.name)) {
      return 'Codeforces Round';
    } else if (/gym/.test(contest.type)) {
      return 'Codeforces Gym';
    } else {
      return 'Codeforces';
    }
  } else if (contest.type === 'nowcoder') {
    return '牛客竞赛';
  } else {
    return contest.type;
  }
};
</script>
