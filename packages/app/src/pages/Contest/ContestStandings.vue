<template>
  <div v-if="contest.standings" class="mt-4 box">
    <c-table :data="standings.standings" :mobile="1080">
      <template #columns="{ row }">
        <c-table-column label="#" align="center" width="4em">
          <span class="font-600">{{ row.rank }}</span>
        </c-table-column>
        <c-table-column :label="isCfRound ? 'Handle' : ''">
          <team-name v-if="!isCfRound" :author="row.author"></team-name>
          <cf-handles v-else :author="row.author"></cf-handles>
        </c-table-column>
        <c-table-column label="解决" align="center" width="4em">
          <span>{{ row.solved }}</span>
        </c-table-column>
        <c-table-column label="罚时" align="center" width="4em">
          <span>{{ toNumDuration(row.penalty).value }}</span>
        </c-table-column>

        <c-table-column
          v-for="(problem, index) in problems"
          :key="problem.index"
          :label="toStrIndex(problem.index)"
          center
          :class="
            isDef(row) &&
            isDef(standings.firstBlood[index]) &&
            isDef(row.result[index]) &&
            row.result[index].verdict === Verdict.OK &&
            row.result[index].relativeTime <=
              (standings.firstBlood[index]?.relativeTime ?? Number.MIN_VALUE) &&
            'bg-[#E0FFE4]'
          "
        >
          <standing-result :result="row.result[index]"> </standing-result>
        </c-table-column>
      </template>
    </c-table>
  </div>
</template>

<script setup lang="ts">
import type { IContest, IContestSubmission } from '@cpany/types';
import { Verdict } from '@cpany/types';

import { computed, toRefs } from 'vue';

import { CTable, CTableColumn } from '@/components/table';
import { isUndef, isDef, toNumDuration } from '@/utils';

import TeamName from './TeamName.vue';
import CfHandles from './CfHandles.vue';
import StandingResult from './StandingResult.vue';

const props = defineProps<{ contest: IContest }>();
const { contest } = toRefs(props);

const isCfRound = computed(() => contest.value.type.startsWith('codeforces'));

const toStrIndex = (index: string | number) =>
  typeof index === 'string' ? index : String.fromCharCode(65 + index);

const problems = computed(() => {
  return (
    contest.value.problems?.sort((lhs, rhs) => {
      const lval =
        typeof lhs.index === 'string'
          ? lhs.index.charCodeAt(0) - 65
          : lhs.index;
      const rval =
        typeof rhs.index === 'string'
          ? rhs.index.charCodeAt(0) - 65
          : rhs.index;
      return lval - rval;
    }) ?? []
  );
});

const standings = computed(() => {
  if (isUndef(contest.value.problems)) return { standings: [], firstBlood: [] };
  if (isUndef(contest.value.standings))
    return { standings: [], firstBlood: [] };

  const firstBlood: Array<IContestSubmission | undefined> = Array(
    contest.value.problems?.length
  );
  for (const standing of contest.value.standings) {
    const result: Array<IContestSubmission | undefined> = Array(
      contest.value.problems?.length
    );
    for (const sub of standing.submissions) {
      const index = sub.problemIndex;
      if (sub.verdict === Verdict.OK) {
        if (isUndef(firstBlood[index])) {
          firstBlood[index] = sub;
        } else {
          const fb = firstBlood[index]!;
          if (fb.relativeTime > sub.relativeTime) {
            firstBlood[index] = sub;
          }
        }
      }

      if (isUndef(result[index])) {
        result[index] = sub;
      } else {
        const r = result[index];
        if ((r?.verdict ?? Verdict.FAILED) !== Verdict.OK) {
          result[index] = sub;
        }
      }
    }
    Reflect.set(standing, 'result', result);
  }

  return { standings: contest.value.standings!, firstBlood };
});
</script>
