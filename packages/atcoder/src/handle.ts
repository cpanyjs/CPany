import type { AxiosInstance } from 'axios';
import { parse } from 'node-html-parser';
import type { IPlugin } from '@cpany/core';
import type { IHandleWithAtCoder } from '@cpany/types/atcoder';

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
    async transform({ id, type }) {
      if (type === name) {
        const user = await fetchUser(api, id);
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
