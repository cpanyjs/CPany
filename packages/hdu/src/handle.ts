import type { IPlugin, ILogger } from '@cpany/core';
import type { IHandleWithHdu } from '@cpany/types/hdu';
import { ISubmission, ParticipantType, Verdict } from '@cpany/types';

import axios from 'axios';
import { parse } from 'node-html-parser';

import { getProblem, addToCache as addToProblemCache } from './problems';

const handles = new Map<string, IHandleWithHdu>();

export function addToCache(handle: IHandleWithHdu) {
  handles.set(handle.handle, handle);
  for (const sub of handle.submissions) {
    addToProblemCache(sub.problem.id as number, sub.problem);
  }
}

export function createHduHandlePlugin(): IPlugin {
  const name = 'hdu/handle';
  const gid = (id: string) => name + '/' + id + '.json';
  return {
    name,
    resolveKey({ id, type }) {
      if (type === name) {
        return gid(id);
      }
    },
    async transform({ id, type }, { logger }) {
      if (type === name) {
        const handle = await fetchHandle(id, logger);
        handle.submissions = await fetchSubmissions(handle, logger);
        return {
          key: gid(id),
          content: JSON.stringify(handle, null, 2)
        };
      }
      return null;
    }
  };
}

export async function fetchHandle(handle: string, logger: ILogger): Promise<IHandleWithHdu> {
  if (handles.has(handle)) return handles.get(handle)!;

  logger.info(`Fetch: Hdu handle ${handle}`);

  const { data } = await axios.get(`https://acm.hdu.edu.cn/userstatus.php?user=${handle}`);
  const rank = /<tr><td>Rank<\/td><td align=center>(\d+)<\/td><\/tr>/.exec(data);
  return {
    type: 'hdu/handle',
    handle,
    hdu: {
      rank: rank !== null && typeof rank[1] === 'string' ? +rank[1] : undefined
    },
    handleUrl: `https://acm.hdu.edu.cn/userstatus.php?user=${handle}`,
    submissions: []
  };
}

export async function fetchSubmissions(
  handle: IHandleWithHdu,
  logger: ILogger
): Promise<ISubmission[]> {
  const latestSubId = handle.submissions.length > 0 ? handle.submissions[0].id : -1;
  const subs: ISubmission[] = [];
  const fetch = async (first?: number) => {
    let minId = first ?? Number.MAX_VALUE;

    const { data } = await axios.get(`https://acm.hdu.edu.cn/status.php`, {
      params: { user: handle.handle, first }
    });

    const root = parse(data);
    const items = root.querySelectorAll('tr[align]').filter((node) => node.childNodes.length === 9);
    for (const node of items) {
      const id = +node.childNodes[0].innerText;
      const language = node.childNodes[7].innerText;
      const time = new Date(node.childNodes[1].innerText).getTime() / 1000;
      const pid = +node.childNodes[3].childNodes[0].innerText;

      const verdict = node.childNodes[2].childNodes[0].innerText;
      // skip waiting
      if (
        id <= latestSubId ||
        verdict === 'Queuing' ||
        verdict === 'Compiling' ||
        verdict === 'Running'
      )
        continue;

      subs.push({
        type: 'hdu',
        id,
        creationTime: time,
        language,
        verdict: parseVerdict(verdict),
        author: {
          members: [handle.handle],
          participantType: ParticipantType.PRACTICE,
          participantTime: time
        },
        problem: await getProblem(pid),
        submissionUrl: `https://acm.hdu.edu.cn/viewcode.php?rid=${id}`
      });

      minId = Math.min(minId, id);
    }

    return minId - 1;
  };

  let curId: number | undefined = undefined;
  while (true) {
    const oldLen = subs.length;
    curId = await fetch(curId);
    if (subs.length === oldLen) break;
  }

  logger.info(`Fetch: Hdu handle ${handle.handle} has fetched ${subs.length} new submissions`);

  return [...subs, ...handle.submissions];
}

function parseVerdict(verdict: string) {
  if (verdict === 'Accepted') return Verdict.OK;
  if (verdict === 'Presentation Error') return Verdict.WRONG_ANSWER;
  if (verdict === 'Wrong Answer') return Verdict.WRONG_ANSWER;
  if (verdict === 'Runtime Error') return Verdict.RUNTIME_ERROR;
  if (verdict === 'Time Limit Exceeded') return Verdict.TIME_LIMIT_EXCEEDED;
  if (verdict === 'Memory Limit Exceeded') return Verdict.MEMORY_LIMIT_EXCEEDED;
  if (verdict === 'Output Limit Exceeded') return Verdict.FAILED;
  if (verdict === 'Compilation Error') return Verdict.COMPILATION_ERROR;
  return Verdict.FAILED;
}
