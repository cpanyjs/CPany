<template>
  <div>
    <h2 class="mb-4">成员</h2>
    <c-table
      :data="extendUsers"
      default-sort="最近通过"
      default-sort-order="desc"
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
          :sort="sortByRecentOk"
          >{{ row.recentOkCount }}</c-table-column
        >
        <c-table-column
          label="最近提交"
          width="7em"
          align="right"
          :sort="sortByRecentSub"
          >{{ row.recentSubCount }}</c-table-column
        >
        <c-table-column
          label="最新通过"
          width="10em"
          align="center"
          :sort="sortByLastSolve"
          ><span v-if="row.lastSolveTime > 0">{{
            toDate(row.lastSolveTime).value
          }}</span></c-table-column
        >
        <c-table-column
          label="最近比赛"
          width="7em"
          align="right"
          :sort="sortByRecentContest"
          >{{ row.recentContest }}</c-table-column
        >

        <c-table-column
          label="通过"
          width="6em"
          align="right"
          :sort="sortByOk"
          >{{ row.okCount }}</c-table-column
        >
        <c-table-column
          label="提交"
          width="6em"
          align="right"
          :sort="sortBySub"
          >{{ row.subCount }}</c-table-column
        >
        <c-table-column
          label="通过率"
          width="6em"
          align="right"
          :sort="sortByOkRate"
          >{{ row.okRate }}</c-table-column
        >
        <c-table-column
          label="比赛场次"
          width="7em"
          align="right"
          :sort="sortByContest"
          >{{ row.contests.length }}</c-table-column
        >
      </template>
    </c-table>
  </div>
</template>

<script setup lang="ts">
import type { IUserOverview } from '@cpany/types';
import { ref, computed } from 'vue';

import { users } from '../users';
import { CTable, CTableColumn } from '../components/table';
import UserLink from '../components/user-link.vue';
import { recentStartTime as defaultRecentStartTime } from '../overview';
import { toDate } from '../utils';

const recentStartTime = ref(defaultRecentStartTime);

const extendFn = (user: IUserOverview) => {
  const subCount = user.submissions.length;
  const okCount = user.submissions.filter(({ v }) => v !== 0).length;
  const okRate =
    (subCount !== 0 ? ((100 * okCount) / subCount).toFixed(1) : '0.0') + ' %';
  const recentSubCount = user.submissions.filter(
    ({ t }) => t >= recentStartTime.value
  ).length;
  const recentOkCount = user.submissions.filter(
    ({ t, v }) => t >= recentStartTime.value && v !== 0
  ).length;
  const recentContest = user.contests.filter(
    ({ t }) => t >= recentStartTime.value
  ).length;
  const solveSubs = user.submissions
    .filter(({ v }) => v === 1)
    .sort((lhs, rhs) => rhs.t - lhs.t);
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

const sortBySub = (lhs: ExtendUser, rhs: ExtendUser) =>
  lhs.subCount - rhs.subCount;
const sortByOk = (lhs: ExtendUser, rhs: ExtendUser) =>
  lhs.okCount - rhs.okCount;
const sortByRecentSub = (lhs: ExtendUser, rhs: ExtendUser) =>
  lhs.recentSubCount - rhs.recentSubCount;
const sortByRecentOk = (lhs: ExtendUser, rhs: ExtendUser) =>
  lhs.recentOkCount - rhs.recentOkCount;

const sortByOkRate = (lhs: ExtendUser, rhs: ExtendUser) =>
  Number.parseFloat(lhs.okRate) - Number.parseFloat(rhs.okRate);
const sortByContest = (lhs: ExtendUser, rhs: ExtendUser) =>
  lhs.contests.length - rhs.contests.length;
const sortByRecentContest = (lhs: ExtendUser, rhs: ExtendUser) =>
  lhs.recentContest - rhs.recentContest;
const sortByLastSolve = (lhs: ExtendUser, rhs: ExtendUser) =>
  lhs.lastSolveTime - rhs.lastSolveTime;
</script>
