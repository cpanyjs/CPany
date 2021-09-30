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

    <div class="mt-4 flex justify-center">
      <c-button @click="displayMore" success>↓ 浏览更多</c-button>
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

const displayContests = ref(contests.slice(0, unit));

const displayMore = () => {
  const curLength = displayContests.value.length;
  displayContests.value.push(...contests.slice(curLength, curLength + unit));
};
</script>
