<template>
  <div>
    <div v-if="contest && !displayError">
      <Page :contest="contest" :dynamic="isDynamic" @refresh="handleRefresh" />
    </div>
    <div v-else-if="displayError" class="divide-y">
      <h2 class="mb-2">错误</h2>
      <p class="pt-2">未找到 ID 为 {{ route.params.id }} 的 Codeforces 比赛</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IContest, IContestProblem, RouteKey } from '@cpany/types';
import { Verdict, ParticipantType } from '@cpany/types';

import { useRoute, useRouter } from 'vue-router';
import { ref, watch, onUnmounted } from 'vue';

import { useGlobalLoading } from '@/components/progress';
import { findCodeforces } from '@/codeforces';
import { handles, findHandleUser } from '@/cfHandles';
import { CodeforcesAPIBase } from '@/config';
import Page from './Contest.vue';

const route = useRoute();

const router = useRouter();

const contest = ref<RouteKey<IContest> | null>(null);

const displayError = ref(false);

const isDynamic = ref(false);

const { start, end } = useGlobalLoading();

const isFetchStanding = ref(false);
const fetchStanding = async (contest: RouteKey<IContest>) => {
  if (isFetchStanding.value) return;
  isFetchStanding.value = true;

  const url = new URL(CodeforcesAPIBase + 'contest.standings');
  url.searchParams.append('contestId', '' + contest.id!);
  url.searchParams.append('handles', handles.map(({ h }) => h).join(';'));
  url.searchParams.append('showUnofficial', 'true');

  const { result } = await (await fetch(url.toString())).json();
  let participantNumber = 0;

  contest.problems = result.problems as IContestProblem[];
  for (const prob of result.problems) {
    prob.problemUrl = `https://codeforces.com/contest/${prob.contestId}/problem/${prob.index}`;
  }
  contest.standings = [];
  for (const row of result.rows) {
    if (
      row.party.participantType !== ParticipantType.CONTESTANT &&
      row.party.participantType !== ParticipantType.VIRTUAL &&
      row.party.participantType !== ParticipantType.OUT_OF_COMPETITION &&
      row.party.participantType !== ParticipantType.PRACTICE
    ) {
      continue;
    }
    if (row.party.participantType !== ParticipantType.PRACTICE) {
      participantNumber++;
    }

    const penalty = row.problemResults.reduce((sum: number, result: any) => {
      if (result.points === 0) return sum;
      return (
        sum + (result.bestSubmissionTimeSeconds ?? 0) + 20 * (result.rejectedAttemptCount ?? 0)
      );
    }, 0);

    const participantTime = row.party.participantTime ?? contest.startTime;

    contest.standings!.push({
      author: {
        members: row.party.members.map((handle: { handle: string }) => handle.handle),
        teamName: row.party.teamName ?? findHandleUser(row.party.members[0].handle),
        participantTime,
        participantType: row.party.participantType
      },
      rank: row.rank,
      solved: row.problemResults.filter((result: { points: number }) => result.points > 0).length,
      penalty,
      submissions: row.problemResults
        .map((result: any, index: number) => {
          const creationTime = result.bestSubmissionTimeSeconds + participantTime;
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

  contest.participantNumber = participantNumber;

  isFetchStanding.value = false;
};

// cache contest.list
const fetchContest = async (id: number) => {
  const url = new URL(CodeforcesAPIBase + 'contest.list');

  const key = 'codeforces/contest.list';
  const { result } = sessionStorage.getItem(key)
    ? { result: JSON.parse(sessionStorage.getItem(key)!) }
    : await (await fetch(url.toString())).json();
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, JSON.stringify(result));
  }

  for (const contest of result) {
    if (contest.id === id) {
      // dep: @cpany/plugin-codeforces contest.ts
      return {
        type: 'codeforces',
        name: contest.name,
        startTime: contest.startTimeSeconds,
        duration: contest.durationSeconds,
        participantNumber: 0,
        id: contest.id,
        phase: contest.phase,
        contestUrl: `https://codeforces.com/contest/${contest.id}`,
        standingsUrl: `https://codeforces.com/contest/${contest.id}/standings`
      };
    }
  }

  return undefined;
};

const handleRefresh = () => {
  fetchStanding(contest.value!);
};

watch(
  () => route.params,
  async (newParams) => {
    if (newParams.id) {
      start();
      const cf = findCodeforces(+newParams.id);
      if (cf !== null) {
        contest.value = cf;
        await fetchStanding(contest.value);
        // Dep: manual update document title
        document.title = `${cf.name} - CPany`;
      } else {
        // dynamic fetch
        const result = (await fetchContest(+newParams.id)) as any;
        if (result) {
          isDynamic.value = true;
          contest.value = result;
          await fetchStanding(contest.value!);
          document.title = `${result.name} - CPany`;
        } else {
          displayError.value = true;
          const returnHome = () => router.replace({ name: 'Home' });
          const timer = setTimeout(returnHome, 3000);
          onUnmounted(() => clearTimeout(timer));
        }
      }
      end();
    }
  },
  { immediate: true }
);
</script>
