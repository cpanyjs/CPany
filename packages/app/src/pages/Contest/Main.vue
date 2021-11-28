<template>
  <div>
    <h2 class="mb-4">所有比赛</h2>

    <c-table :data="displayContests">
      <template #columns="{ row, index }">
        <c-table-column label="#" center>
          <span class="font-600">{{ index + 1 }}</span>
        </c-table-column>
        <c-table-column label="比赛" :mobile-header-class="['min-w-8']">
          <router-link :to="row.path">{{ row.name }}</router-link>
        </c-table-column>
        <c-table-column label="平台" center>
          <span>{{ displayContestType(row) }}</span>
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

    <div class="mt-4 flex justify-between items-center">
      <div></div>
      <c-button @click="displayMore" success>↓ 浏览更多</c-button>
      <div class="text-gray-400 pr-4">共 <span class="font-mono">{{ length }}</span> 场比赛</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import IconAccount from '~icons/mdi/account';

import { contests } from '@/contests';
import { CTable, CTableColumn } from '@/components/table';
import { recentContestsCount } from '@/overview';
import { toDate, displayContestType } from '@/utils';

const unit = recentContestsCount * 2;

const KEY = 'contest.size';

const load = () => {
  const value = sessionStorage.getItem(KEY);
  return value !== null ? +value : unit;
};

const store = (len: number) => {
  sessionStorage.setItem(KEY, String(len));
};

const displayContests = ref(contests.slice(0, load()));

const displayMore = () => {
  const curLength = displayContests.value.length;
  displayContests.value.push(...contests.slice(curLength, curLength + unit));
  store(displayContests.value.length);
};

const length = contests.length;
</script>
