<template>
  <div v-if="user" class="divide-y">
    <h2 class="mb-2">{{ user.name }}</h2>

    <div class="flex py-4">
      <div v-if="avatar !== null" class="mr-4">
        <img :src="avatar" :alt="`${user.name}'s avatar`" />
      </div>
      <div>
        <span>账号：</span>
        <span
          v-for="handle in user.handles"
          :key="handle.handle"
          class="ml-2"
          >{{ handle.handle }}</span
        >
      </div>
    </div>

    <div class="py-4">
      <h3 class="my-4 text-center">所有提交</h3>
      <c-table :data="submissions.slice(0, 20)">
        <template #columns="{ row }">
          <c-table-column class="font-600" label="#" center>
            <span>{{ row.index }}</span>
          </c-table-column>
          <c-table-column label="时间" center>
            <a :href="row.submissionUrl" target="_blank">{{
              toDate(row.creationTime).value
            }}</a>
          </c-table-column>
          <c-table-column label="题目">
            <a :href="row.problem.problemUrl" target="_blank">{{
              row.problem.id + ' ' + row.problem.name
            }}</a>
          </c-table-column>
          <c-table-column label="语言" center>
            <span>{{ row.language }}</span>
          </c-table-column>
          <c-table-column label="结果" center>
            <icon-check
              v-if="row.verdict === Verdict.OK"
              class="text-green-400"
            ></icon-check>
            <icon-close v-else class="text-red-400"></icon-close>
          </c-table-column>
        </template>
      </c-table>
    </div>

    <div>
      <h3 class="my-4 text-center">所有比赛</h3>
      <c-table :data="contests">
        <template #columns="{ row, index }">
          <c-table-column class="font-600" label="#" center>
            <span>{{ index + 1 }}</span>
          </c-table-column>
          <c-table-column label="时间" center>
            <a :href="row.contestUrl">{{
              toDate(row.author.participantTime).value
            }}</a>
          </c-table-column>
          <c-table-column label="比赛">
            <router-link :to="row.path">{{ row.name }}</router-link>
          </c-table-column>
        </template>
      </c-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IUser, ISubmission, IContest } from '@cpany/types';
import { Verdict } from '@cpany/types';
import { ref, toRefs } from 'vue';

import IconCheck from 'virtual:vite-icons/mdi/check';
import IconClose from 'virtual:vite-icons/mdi/close';
import { CTable, CTableColumn } from '@/components/table';
import { toDate } from '@/utils';

const props = defineProps<{ user: IUser }>();
const { user } = toRefs(props);

const avatar = ref<string | null>(null);
for (const handle of user.value.handles) {
  if (
    handle.avatar !== undefined &&
    handle.avatar !== null &&
    handle.avatar !== ''
  ) {
    avatar.value = handle.avatar;
    break;
  }
}

const submissions = ref<ISubmission[]>(
  ([] as ISubmission[])
    .concat(...user.value.handles.map((handle) => handle.submissions))
    .sort((lhs, rhs) => lhs.creationTime - rhs.creationTime)
    .map((sub, index) => ({ index: index + 1, ...sub }))
    .reverse()
);
const contests = ref<IContest[]>(user.value.contests);
</script>
