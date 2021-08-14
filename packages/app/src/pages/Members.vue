<template>
  <div>
    <h2 class="mb-4">成员</h2>
    <c-table :data="users">
      <template #columns="{ index, row }">
        <c-table-column label="#" width="4em" align="center"
          ><span class="font-600">{{ index + 1 }}</span></c-table-column
        >
        <c-table-column label="姓名">
          {{ row.name }}
        </c-table-column>
        <c-table-column label="提交总数" width="6em" align="center">{{
          row.submissions.length
        }}</c-table-column>
        <c-table-column label="比赛场次" width="6em" align="center">{{
          row.contests.length
        }}</c-table-column>
      </template>
    </c-table>
  </div>
</template>

<script setup lang="ts">
import { users } from '../overview';
import { CTable, CTableColumn } from '../components/table';
</script>

<style></style>
