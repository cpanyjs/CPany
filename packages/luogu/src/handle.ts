import { IPlugin } from '@cpany/core';
import type { IHandleWithLuogu, UserDataDto } from '@cpany/types/luogu';

import { AxiosInstance } from 'axios';

export function createLuoguHandlePlugin(api: AxiosInstance): IPlugin {
  const name = 'luogu/handle';
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

async function fetchUser(
  api: AxiosInstance,
  id: string
): Promise<IHandleWithLuogu> {
  const { data } = await api.get<UserDataDto>('/user/' + id);
  return {
    type: 'luogu/handle',
    handle: id,
    submissions: [],
    avatar: `https://cdn.luogu.com.cn/upload/usericon/${id}.png`,
    handleUrl: `https://www.luogu.com.cn/user/${id}`,
    luogu: {
      name: data.currentData.user.name
    }
  };
}
