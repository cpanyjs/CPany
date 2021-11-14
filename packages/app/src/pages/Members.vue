<template>
  <div class="divide-y">
    <h2 class="mb-4">成员</h2>
    <c-table
      :data="extendUsers"
      cache="members"
      :default-sort="defaultSort"
      :default-sort-order="defaultSortOrder"
    >
      <template #columns="{ index, row }">
        <c-table-column label="#" width="3em" align="center"
          ><span class="font-600">{{ index + 1 }}</span></c-table-column
        >
        <c-table-column label="姓名">
          <user-link :name="row.name"></user-link>
        </c-table-column>

        <c-table-column
          label="最近通过"
          width="7em"
          align="right"
          :sort="normalSortBy(sortByRecentOk)"
          >{{ row.recentOkCount }}</c-table-column
        >
        <c-table-column
          label="最近提交"
          width="7em"
          align="right"
          :sort="normalSortBy(sortByRecentSub)"
          >{{ row.recentSubCount }}</c-table-column
        >
        <c-table-column
          label="最近比赛"
          width="7em"
          align="right"
          :sort="normalSortBy(sortByRecentContest)"
          >{{ row.recentContest }}</c-table-column
        >
        <c-table-column
          label="最新通过"
          width="10em"
          align="center"
          :sort="normalSortBy(sortByLastSolve)"
          ><span v-if="row.lastSolveTime > 0">{{
            toDate(row.lastSolveTime).value
          }}</span></c-table-column
        >

        <c-table-column label="通过" width="6em" align="right" :sort="normalSortBy(sortByOk)">{{
          row.okCount
        }}</c-table-column>
        <c-table-column label="提交" width="6em" align="right" :sort="normalSortBy(sortBySub)">{{
          row.subCount
        }}</c-table-column>
        <c-table-column
          label="通过率"
          width="6em"
          align="right"
          :sort="normalSortBy(sortByOkRate)"
          >{{ row.okRate }}</c-table-column
        >
        <c-table-column
          label="比赛场次"
          width="7em"
          align="right"
          :sort="normalSortBy(sortByContest)"
          >{{ row.contests.length }}</c-table-column
        >
      </template>
    </c-table>
    <div class="mt-4 pt-4">
      <span class="text-gray-400">最近开始于 {{ toDate(recentStartTime).value }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IUserOverview } from '@cpany/types';
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

import { users } from '../users';
import { CTable, CTableColumn } from '../components/table';
import UserLink from '../components/user-link.vue';
import { recentStartTime as defaultRecentStartTime } from '../overview';
import { combineCmp, createSortBy, createSortByString, toDate } from '../utils';

const route = useRoute();
const defaultSort = String(route.query.sort ?? '最近通过');
const defaultSortOrder = String(route.query.order ?? 'desc');

const recentStartTime = ref(defaultRecentStartTime);

const extendFn = (user: IUserOverview) => {
  const subCount = user.submissions.length;
  const okCount = user.submissions.filter(({ v }) => v !== 0).length;
  const okRate = (subCount !== 0 ? ((100 * okCount) / subCount).toFixed(1) : '0.0') + ' %';
  const recentSubCount = user.submissions.filter(({ t }) => t >= recentStartTime.value).length;
  const recentOkCount = user.submissions.filter(
    ({ t, v }) => t >= recentStartTime.value && v !== 0
  ).length;
  const recentContest = user.contests.filter(({ t }) => t >= recentStartTime.value).length;
  const solveSubs = user.submissions.filter(({ v }) => v === 1).sort((lhs, rhs) => rhs.t - lhs.t);
  const lastSolveTime = solveSubs.length > 0 ? solveSubs[0].t : 0;
  return {
    subCount,
    okCount,
    okRate,
    recentSubCount,
    recentOkCount,
    recentContest,
    lastSolveTime,
    ...user
  };
};

const extendUsers = computed(() => users.map(extendFn));

type ExtendUser = ReturnType<typeof extendFn>;

const sortByRecentOk = createSortBy<ExtendUser>((handle) => handle.recentOkCount);
const sortByRecentContest = createSortBy<ExtendUser>((handle) => handle.recentContest);
const sortByLastSolve = createSortBy<ExtendUser>((handle) => handle.lastSolveTime);
const sortByRecentSub = createSortBy<ExtendUser>((handle) => handle.recentSubCount);
const sortByOk = createSortBy<ExtendUser>((handle) => handle.okCount);
const sortByContest = createSortBy<ExtendUser>((handle) => handle.contests.length);
const sortBySub = createSortBy<ExtendUser>((handle) => handle.subCount);
const sortByOkRate = createSortBy<ExtendUser>((handle) => Number.parseFloat(handle.okRate));

const sortByName = createSortByString<ExtendUser>((handle) => handle.name);

function normalSortBy(cmpFn: typeof sortBySub) {
  return combineCmp(
    cmpFn,
    sortByRecentOk,
    sortByRecentContest,
    sortByLastSolve,
    sortByRecentSub,
    sortByOk,
    sortByContest,
    sortBySub,
    sortByOkRate,
    sortByName
  );
}
</script>
