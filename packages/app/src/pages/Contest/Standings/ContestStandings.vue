<template>
  <div v-if="contest.standings" class="mt-4 box">
    <c-table :data="standings.standings" :mobile="1023">
      <template #columns="{ row }">
        <c-table-column label="#" align="center" width="4em">
          <span v-if="!isPractice(row)" class="font-600">{{ row.rank }}</span>
          <span v-else class="font-600">-</span>
        </c-table-column>
        <c-table-column :label="isCfRound ? 'Handle' : ''">
          <div class="flex items-center">
            <icon-star
              v-if="isOutOfCompetition(row)"
              class="mr-1 text-sm text-yellow-300 inline-block"
            ></icon-star>
            <div>
              <cf-handles v-if="isCfRound" :author="row.author"></cf-handles>
              <at-handles v-else-if="isAtRound" :author="row.author"></at-handles>
              <team-name v-else :author="row.author"></team-name>
            </div>
          </div>
        </c-table-column>
        <c-table-column label="解决" align="center" width="4em">
          <span>{{ row.solved }}</span>
        </c-table-column>
        <c-table-column label="罚时" align="center" width="4em">
          <span v-if="!isPractice(row)">{{ toNumDuration(row.penalty).value }}</span>
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
              (standings.firstBlood[index]?.relativeTime ?? Number.MIN_SAFE_INTEGER) &&
            'bg-[#E0FFE4]'
          "
        >
          <standing-result
            :result="row.result[index]"
            :practice="isPractice(row)"
          ></standing-result>
        </c-table-column>
      </template>
    </c-table>
  </div>
</template>

<script setup lang="ts">
import type { IContest, IContestStanding, IContestSubmission } from '@cpany/types';
import { Verdict, ParticipantType } from '@cpany/types';

import { computed, toRefs } from 'vue';

import IconStar from '~icons/mdi/star';
import { CTable, CTableColumn } from '@/components/table';
import { isUndef, isDef, toNumDuration } from '@/utils';

import TeamName from './TeamName.vue';
import CfHandles from './CfHandles.vue';
import AtHandles from './AtHandles.vue';

import StandingResult from './StandingResult.vue';

const props = defineProps<{ contest: IContest }>();
const { contest } = toRefs(props);

const isCfRound = computed(() => contest.value.type.startsWith('codeforces'));
const isAtRound = computed(() => contest.value.type.startsWith('atcoder'));

const isOutOfCompetition = (standing: IContestStanding) =>
  standing.author.participantType === ParticipantType.OUT_OF_COMPETITION;

const isPractice = (standing: IContestStanding) =>
  standing.author.participantType === ParticipantType.PRACTICE;

const toStrIndex = (index: string | number) =>
  typeof index === 'string' ? index : String.fromCharCode(65 + index);

const problems = computed(() => {
  return (
    contest.value.problems?.sort((lhs, rhs) => {
      const lval = typeof lhs.index === 'string' ? lhs.index.charCodeAt(0) - 65 : lhs.index;
      const rval = typeof rhs.index === 'string' ? rhs.index.charCodeAt(0) - 65 : rhs.index;
      return lval - rval;
    }) ?? []
  );
});

const standings = computed(() => {
  if (isUndef(contest.value.problems)) return { standings: [], firstBlood: [] };
  if (isUndef(contest.value.standings)) return { standings: [], firstBlood: [] };

  const firstBlood: Array<IContestSubmission | undefined> = Array(contest.value.problems?.length);

  for (const standing of contest.value.standings) {
    const result: Array<IContestSubmission | undefined> = Array(contest.value.problems?.length);
    for (const sub of standing.submissions) {
      const index = sub.problemIndex;

      if (sub.verdict === Verdict.OK && !isPractice(standing)) {
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
