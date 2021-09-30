import type { AxiosInstance } from "axios";
import { parse } from 'node-html-parser';
import type { IPlugin } from "@cpany/core";
import type { IHandleWithAtCoder } from "@cpany/types/atcoder";

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
  const avatar = (() => {
    const raw = root.querySelector('img.avatar')?.getAttribute('src');
    if (!raw) return undefined;
    if (raw === '//img.atcoder.jp/assets/icon/avatar.png') return undefined;
    return raw;
  })();

  return {
    type: 'atcoder/handle',
    handle: id,
    submissions: [],
    avatar,
    handleUrl: 'https://atcoder.jp/users/' + id,
    atcoder: {}
  };
}
