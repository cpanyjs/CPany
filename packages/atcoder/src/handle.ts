import type { AxiosInstance } from 'axios';
import { parse } from 'node-html-parser';
import { decode } from 'html-entities';

import type { IHandleWithAtCoder } from '@cpany/types/atcoder';
import { ISubmission, ParticipantType, Verdict } from '@cpany/types';
import { IPlugin, ILogger, createRetryContainer } from '@cpany/core';

import { addContestPractice, pushContest } from './contest';

export function createAtCoderHandlePlugin(api: AxiosInstance): IPlugin {
  const name = 'atcoder/handle';
  const gid = (id: string) => name + '/' + id + '.json';
  return {
    name,
    resolveKey({ id, type }) {
      if (type === name) {
        return gid(id);
      }
      return null;
    },
    async transform({ id, type }, { logger }) {
      if (type === name) {
        const user = await fetchUser(api, id);
        user.submissions = await fetchSubmissions(api, id, logger);
        return { key: gid(id), content: JSON.stringify(user, null, 2) };
      }
      return null;
    }
  };
}

async function fetchUser(api: AxiosInstance, id: string): Promise<IHandleWithAtCoder> {
  const { data } = await api.get('/users/' + id);
  const root = parse(data);

  const color = (() => {
    const username = root.querySelector('a.username span');
    const style = username.getAttribute('style');
    if (!style) return undefined;
    const res = /(#[0-9A-F]{6})/.exec(style);
    return res ? res[1] : undefined;
  })();

  const avatar = (() => {
    const raw = root.querySelector('img.avatar')?.getAttribute('src');
    if (!raw) return undefined;
    if (raw === '//img.atcoder.jp/assets/icon/avatar.png') return undefined;
    return raw;
  })();

  const fields = root.querySelectorAll('.col-md-9 .dl-table tr td');
  const rank = 0 < fields.length ? Number.parseInt(fields[0].innerText) : undefined;
  const rating =
    1 < fields.length ? Number.parseInt(fields[1].querySelector('span').innerText) : undefined;
  const maxRating =
    2 < fields.length ? Number.parseInt(fields[2].querySelector('span').innerText) : undefined;

  return {
    type: 'atcoder/handle',
    handle: id,
    submissions: [],
    avatar,
    handleUrl: 'https://atcoder.jp/users/' + id,
    atcoder: {
      rank,
      rating,
      maxRating,
      color
    }
  };
}

async function fetchSubmissions(
  api: AxiosInstance,
  id: string,
  logger: ILogger
): Promise<ISubmission[]> {
  const { data } = await api.get('/users/' + id + '/history');
  const root = parse(data);

  const contests = root
    .querySelectorAll('tr td.text-left')
    .map((td) => td.querySelector('a').getAttribute('href')?.split('/')[2]!)
    .filter((contest) => !!contest);

  logger.info(`Fetch: ${id} has participated in ${contests.length} contests`);

  const run = async (contest: string) => {
    const submissions: ISubmission[] = [];

    for (let page = 1; ; page++) {
      const oldLen = submissions.length;

      const { data } = await api.get(`/contests/${contest}/submissions`, {
        params: {
          'f.User': id,
          page
        }
      });
      const root = parse(data);

      const durations = root.querySelectorAll('.contest-duration a');
      const startTime = new Date(durations[0].innerText).getTime() / 1000;
      const endTime = new Date(durations[1].innerText).getTime() / 1000;

      submissions.push(
        ...root.querySelectorAll('table.table tbody tr').map((tr) => {
          const td = tr.querySelectorAll('td');

          const sid = +td[td.length - 1].querySelector('a').getAttribute('href')?.split('/').pop()!;
          const creationTime = new Date(td[0].innerText).getTime() / 1000;
          const language = decode(td[3].innerText.replace(/\([\s\S]*\)/, '').trim());
          const verdict: Verdict = ((str: string) => {
            if (str === 'AC') return Verdict.OK;
            if (str === 'WA') return Verdict.WRONG_ANSWER;
            if (str === 'TLE') return Verdict.TIME_LIMIT_EXCEEDED;
            if (str === 'MLE') return Verdict.MEMORY_LIMIT_EXCEEDED;
            if (str === 'OLE') return Verdict.IDLENESS_LIMIT_EXCEEDED;
            if (str === 'RE') return Verdict.RUNTIME_ERROR;
            if (str === 'CE') return Verdict.COMPILATION_ERROR;
            return Verdict.FAILED;
          })(td[6].innerText);

          const type =
            startTime <= creationTime && creationTime < endTime
              ? ParticipantType.CONTESTANT
              : ParticipantType.PRACTICE;

          const problemId = ((id) => {
            const [a, b] = id.split('_');
            return a + b.toUpperCase();
          })(td[1].querySelector('a').getAttribute('href')?.split('/').pop()!);
          const problemName = decode(/^[\s\S]+ - ([\s\S]+)$/.exec(td[1].innerText)![1]);

          return {
            type: 'atcoder',
            id: sid,
            creationTime,
            language,
            verdict,
            author: {
              members: [id],
              participantType: type,
              participantTime: type === ParticipantType.CONTESTANT ? startTime : creationTime
            },
            submissionUrl:
              'https://atcoder.jp' + td[td.length - 1].querySelector('a').getAttribute('href'),
            problem: {
              type: 'atcoder',
              id: problemId,
              name: problemName,
              problemUrl: 'https://atcoder.jp' + td[1].querySelector('a').getAttribute('href')
            }
          };
        })
      );

      if (submissions.length === oldLen) break;
    }

    addContestPractice(contest, id, submissions);

    logger.info(`Fetch: ${id} has created ${submissions.length} submissions in ${contest}`);

    return submissions;
  };

  const retry = createRetryContainer(logger, 5);
  const submissions: ISubmission[] = [];
  for (const contest of contests) {
    pushContest(contest);
    retry.add(`${id}'s submissions at ${contest}'`, async () => {
      try {
        submissions.push(...(await run(contest)));
        return true;
      } catch (error) {
        logger.error('Error: ' + (error as any).message);
        return false;
      }
    });
  }
  await retry.run();

  return submissions;
}
