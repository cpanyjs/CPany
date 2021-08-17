<template>
  <div>
    <h2 class="mb-4">成员</h2>
    <c-table
      :data="extendUsers"
      default-sort="正确提交"
      default-sort-order="desc"
    >
      <template #columns="{ index, row }">
        <c-table-column label="#" width="4em" align="center"
          ><span class="font-600">{{ index + 1 }}</span></c-table-column
        >
        <c-table-column label="姓名">
          <user-link :name="row.name"></user-link>
        </c-table-column>
        <c-table-column
          label="正确提交"
          width="8em"
          align="right"
          :sort="sortByOk"
          >{{ row.okCount }}</c-table-column
        >
        <c-table-column
          label="提交总数"
          width="8em"
          align="right"
          :sort="sortBySub"
          >{{ row.subCount }}</c-table-column
        >
        <c-table-column
          label="通过率"
          width="8em"
          align="right"
          :sort="sortByOkRate"
          >{{ row.okRate }}</c-table-column
        >
        <c-table-column
          label="比赛场次"
          width="8em"
          align="right"
          :sort="sortByContest"
          >{{ row.contests.length }}</c-table-column
        >
      </template>
    </c-table>
  </div>
</template>

<script setup lang="ts">
import { Verdict } from '@cpany/types';
import { users } from '../users';
import { CTable, CTableColumn } from '../components/table';
import UserLink from '../components/user-link.vue';

const extendUsers = users.map((user) => {
  const subCount = user.handles.reduce(
    (sum, handle) => sum + handle.submissions.length,
    0
  );
  const okCount = user.handles.reduce(
    (sum, handle) =>
      sum +
      handle.submissions.filter((sub) => sub.verdict === Verdict.OK).length,
    0
  );
  const okRate =
    (subCount !== 0 ? ((100 * okCount) / subCount).toFixed(1) : '0.0') + ' %';
  return { subCount, okCount, okRate, ...user };
});

type ExtendUser = typeof extendUsers[number];

const sortBySub = (lhs: ExtendUser, rhs: ExtendUser) =>
  lhs.subCount - rhs.subCount;
const sortByOk = (lhs: ExtendUser, rhs: ExtendUser) =>
  lhs.okCount - rhs.okCount;
const sortByOkRate = (lhs: ExtendUser, rhs: ExtendUser) =>
  Number.parseFloat(lhs.okRate) - Number.parseFloat(rhs.okRate);
const sortByContest = (lhs: ExtendUser, rhs: ExtendUser) =>
  lhs.contests.length - rhs.contests.length;
</script>
