import { QueryPlugin } from '@cpany/core';
import { IHandleWithNowcoder } from '@cpany/types/nowcoder';
import axios from 'axios';
import { parse } from 'node-html-parser';

import { nowcoder } from './constant';

export function createHandlePlugin(): QueryPlugin {
  return {
    name: 'handle',
    platform: nowcoder,
    async query(id, { logger }) {
      const handle = await queryHandle(id);
      return JSON.stringify(handle, null, 2);
    }
  };
}

async function queryHandle(handle: string): Promise<IHandleWithNowcoder> {
  const handleUrl = `https://ac.nowcoder.com/acm/contest/profile/${handle}`;
  const { data } = await axios.get(handleUrl);
  const root = parse(data);
  const avatar = root.querySelector('.head-pic img')?.getAttribute('src');
  const name = root.querySelector('.coder-name.rate-score4').getAttribute('data-title')!;
  const rating = root.querySelector('.state-num.rate-score4').childNodes[0].innerText;
  return {
    type: nowcoder,
    handle,
    submissions: [],
    avatar,
    handleUrl,
    nowcoder: {
      name,
      rating: rating !== undefined && rating !== null ? +rating : undefined
    }
  };
}
