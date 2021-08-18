<template>
  <div>
    <div v-if="contest">
      <Page :contest="contest" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IContest, IContestProblem, RouteKey } from '@cpany/types';
import { Verdict, ParticipantType } from '@cpany/types';

import { useRoute } from 'vue-router';
import { ref, watch } from 'vue';

import { useGlobalLoading } from '@/components/progress';
import { findCodeforces } from '@/codeforces';
import { handles, findHandleUser } from '@/cfHandles';
import { CodeforcesAPIBase } from '@/config';
import Page from './Contest.vue';

const route = useRoute();

const contest = ref<RouteKey<IContest> | null>(null);

const { start, end } = useGlobalLoading();

const fetchStanding = async (contest: RouteKey<IContest>) => {
  start();

  const url = new URL(CodeforcesAPIBase + 'contest.standings');
  url.searchParams.append('contestId', '' + contest.id!);
  url.searchParams.append('handles', handles.map(({ h }) => h).join(';'));
  url.searchParams.append('showUnofficial', 'true');

  const { result } = await (await fetch(url.toString())).json();

  contest.problems = result.problems as IContestProblem[];
  for (const prob of result.problems) {
    prob.problemUrl = `https://codeforces.com/contest/${prob.contestId}/problem/${prob.index}`;
  }
  contest.standings = [];
  for (const row of result.rows) {
    // Skip practise
    if (
      row.party.participantType !== ParticipantType.CONTESTANT &&
      row.party.participantType !== ParticipantType.VIRTUAL &&
      row.party.participantType !== ParticipantType.PRACTICE
    ) {
      continue;
    }

    const penalty = row.problemResults.reduce((sum: number, result: any) => {
      if (result.points === 0) return sum;
      return (
        sum +
        (result.bestSubmissionTimeSeconds ?? 0) +
        20 * (result.rejectedAttemptCount ?? 0)
      );
    }, 0);

    const participantTime = row.party.participantTime ?? contest.startTime;

    contest.standings!.push({
      author: {
        members: row.party.members.map(
          (handle: { handle: string }) => handle.handle
        ),
        teamName:
          row.party.teamName ?? findHandleUser(row.party.members[0].handle),
        participantTime,
        participantType: row.party.participantType
      },
      rank: row.rank,
      solved: row.problemResults.filter(
        (result: { points: number }) => result.points > 0
      ).length,
      penalty,
      submissions: row.problemResults
        .map((result: any, index: number) => {
          const creationTime =
            result.bestSubmissionTimeSeconds + participantTime;
          const relativeTime = result.bestSubmissionTimeSeconds;
          if (result.points > 0) {
            return {
              id: -1,
              creationTime,
              relativeTime,
              problemIndex: index,
              verdict: Verdict.OK,
              dirty: result.rejectedAttemptCount
            };
          } else if (result.rejectedAttemptCount > 0) {
            return {
              id: -1,
              creationTime,
              relativeTime,
              problemIndex: index,
              dirty: result.rejectedAttemptCount
            };
          } else {
            return null;
          }
        })
        .filter((result: any) => result !== null)
    });
  }

  end();
};

watch(
  () => route.params,
  (newParams) => {
    if (newParams.id) {
      const cf = findCodeforces(+newParams.id);
      if (cf !== null) {
        contest.value = cf;
        fetchStanding(contest.value);
        // Dep: manual update document title
        document.title = `${cf.name} - CPany`;
      }
    }
  },
  { immediate: true }
);
</script>
