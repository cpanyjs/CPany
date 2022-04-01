import { Logger, QueryPlugin } from '@cpany/core';
import { ISubmission, ParticipantType, Verdict } from '@cpany/types';
import { IHandleWithNowcoder } from '@cpany/types/nowcoder';

import axios from 'axios';
import { parse } from 'node-html-parser';

import { nowcoder } from './constant';

const handleCache = new Map<string, IHandleWithNowcoder>();

export function addToCache(handle: IHandleWithNowcoder) {
  handleCache.set(handle.handle, handle);
}

export function createHandlePlugin(): QueryPlugin {
  return {
    name: 'handle',
    platform: nowcoder,
    async query(id, { logger }) {
      const handle = await queryHandle(id);
      handle.submissions = await querySubmission(id, handle.nowcoder.name, logger);
      return JSON.stringify(handle, null, 2);
    }
  };
}

async function queryHandle(handle: string): Promise<IHandleWithNowcoder> {
  const handleUrl = `https://ac.nowcoder.com/acm/contest/profile/${handle}`;
  const { data } = await axios.get(handleUrl);
  const root = parse(/<body>([\s\S]*)<\/body>/.exec(data)![0]);
  const avatar = root.querySelector('.head-pic img')?.getAttribute('src');
  const getName = (text: string) => {
    const match = /data-title="([^"]+)"/.exec(text);
    return match![1];
  };
  const name = getName(root.querySelector('.coder-info-detail').innerHTML);
  const rating = root.querySelector('.state-num')?.childNodes[0].innerText;

  return {
    type: nowcoder,
    handle,
    submissions: [],
    avatar,
    handleUrl,
    nowcoder: {
      name,
      rating: rating !== undefined && rating !== null && rating !== '暂无' ? +rating : undefined
    }
  };
}

async function querySubmission(
  handle: string,
  name: string,
  logger: Logger
): Promise<ISubmission[]> {
  const subs: ISubmission[] = handleCache.get(handle)?.submissions ?? [];
  const ids = new Set(subs.map((s) => s.id));
  const fetchPage = async (page: number) => {
    const { data } = await axios.get(
      `https://ac.nowcoder.com/acm/contest/profile/${handle}/practice-coding?pageSize=200&orderType=DESC&page=${page}`
    );
    const root = parse(/<body>([\s\S]*)<\/body>/.exec(data)![0]);
    const oldLen = subs.length;
    for (const row of root.querySelectorAll('table.table-hover tbody tr')) {
      const childNodes = row.querySelectorAll('td');
      const id = +childNodes[0].childNodes[0].innerText!;
      if (ids.has(id)) continue;

      const problemName = childNodes[1].querySelector('a').innerText!;
      const parseId = (text: string) => {
        const split = text.split('/');
        return +split[split.length - 1];
      };
      const problemId = parseId(childNodes[1].querySelector('a').getAttribute('href')!);

      const verdictRaw = childNodes[2].innerHTML!;
      const checkVerdict = (text: string) => verdictRaw.indexOf(text) !== -1;
      const verdict = checkVerdict('答案正确')
        ? Verdict.OK
        : checkVerdict('运行超时')
        ? Verdict.TIME_LIMIT_EXCEEDED
        : checkVerdict('执行出错')
        ? Verdict.RUNTIME_ERROR
        : checkVerdict('段错误')
        ? Verdict.RUNTIME_ERROR
        : Verdict.WRONG_ANSWER;

      const language = childNodes[7].innerText;
      const time = new Date(childNodes[8].innerText);

      subs.push({
        type: nowcoder,
        id,
        creationTime: time.getTime() / 1000,
        language,
        verdict,
        author: {
          members: [handle],
          participantTime: time.getTime() / 1000,
          participantType: ParticipantType.PRACTICE
        },
        problem: {
          type: nowcoder,
          id: problemId,
          name: problemName,
          problemUrl: `https://ac.nowcoder.com/acm/problem/${problemId}`
        },
        submissionUrl: `https://ac.nowcoder.com/acm/contest/view-submission?submissionId=${id}`
      });
      ids.add(id);
    }
    if (subs.length === oldLen) return false;
    logger.info(
      `Fetch: (name: ${name}, id: ${handle}) has fetched ${
        subs.length - oldLen
      } new submissions at page ${page}`
    );
    return true;
  };
  for (let page = 1; ; page++) {
    if (!(await fetchPage(page))) {
      break;
    }
  }
  return subs;
}
