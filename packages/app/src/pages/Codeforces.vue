<template>
  <div class="divide-y">
    <h2 class="mb-4">Codeforces</h2>
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

        <c-table-column label="Handle"
          ><cf-rating-color :rating="row.rating">{{
            row.handle
          }}</cf-rating-color></c-table-column
        >
        <c-table-column label="Rating" :sort="sortByRating" align="right"
          ><cf-rating-color :rating="row.rating">{{
            row.rating
          }}</cf-rating-color></c-table-column
        >

        <c-table-column
          label="最近通过"
          width="7em"
          align="right"
          :sort="sortByRecentOk"
          >{{ row.recentOkCount }}</c-table-column
        >
        <c-table-column
          label="最近比赛"
          width="7em"
          align="right"
          :sort="sortByRecentContest"
          >{{ row.recentContest }}</c-table-column
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
          label="通过"
          width="6em"
          align="right"
          :sort="sortByOk"
          >{{ row.okCount }}</c-table-column
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
    <div class="mt-4 pt-4">
      <span class="text-gray-400"
        >最近开始于 {{ toDate(recentStartTime).value }}</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IUserOverview } from '@cpany/types';
import type { IHandleWithCodeforces } from '@cpany/types/codeforces';
import { ref, computed } from 'vue';

import { users } from '../users';
import { CTable, CTableColumn } from '../components/table';
import UserLink from '../components/user-link.vue';
import { CfRatingColor } from '../components/codeforces';
import { recentStartTime as defaultRecentStartTime } from '../overview';
import { toDate } from '../utils';

const recentStartTime = ref(defaultRecentStartTime);

const isTypeCf = (type: string) => type.startsWith('codeforces');

const extendFn = (user: IUserOverview) => {
  const submissions = user.submissions.filter(({ type }) => isTypeCf(type));
  const subCount = submissions.length;
  const okCount = submissions.filter(({ v }) => v === 1).length;
  const recentSubCount = submissions.filter(
    ({ t }) => t >= recentStartTime.value
  ).length;
  const recentOkCount = submissions.filter(
    ({ t, v }) => t >= recentStartTime.value && v === 1
  ).length;
  const recentContest = user.contests.filter(
    ({ type, t }) => t >= recentStartTime.value && isTypeCf(type)
  ).length;
  const solveSubs = submissions
    .filter(({ v }) => v === 1)
    .sort((lhs, rhs) => rhs.t - lhs.t);
  const lastSolveTime = solveSubs.length > 0 ? solveSubs[0].t : 0;

  const handles = user.handles.filter((user) => isTypeCf(user.type));
  let handle = handles.length > 0 ? handles[0] : '';
  const rating = handles.reduce((max, _handle) => {
    const cfHandle = _handle as unknown as IHandleWithCodeforces;
    if (cfHandle.codeforces.rating > max) {
      handle = cfHandle.handle;
      return cfHandle.codeforces.rating;
    } else {
      return max;
    }
  }, 0);

  return {
    subCount,
    okCount,
    recentSubCount,
    recentOkCount,
    recentContest,
    lastSolveTime,
    rating,
    handle,
    ...user
  };
};

const extendUsers = computed(() => users.map(extendFn));

type ExtendUser = ReturnType<typeof extendFn>;

const sortByRating = (lhs: ExtendUser, rhs: ExtendUser) =>
  lhs.rating - rhs.rating;
const sortByOk = (lhs: ExtendUser, rhs: ExtendUser) =>
  lhs.okCount - rhs.okCount;
const sortByRecentOk = (lhs: ExtendUser, rhs: ExtendUser) =>
  lhs.recentOkCount - rhs.recentOkCount;

const sortByContest = (lhs: ExtendUser, rhs: ExtendUser) =>
  lhs.contests.length - rhs.contests.length;
const sortByRecentContest = (lhs: ExtendUser, rhs: ExtendUser) =>
  lhs.recentContest - rhs.recentContest;
const sortByLastSolve = (lhs: ExtendUser, rhs: ExtendUser) =>
  lhs.lastSolveTime - rhs.lastSolveTime;
</script>
