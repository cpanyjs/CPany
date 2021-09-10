import { IPlugin } from '@cpany/core';

export function createLuoguHandlePlugin(): IPlugin {
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
      return null;
    }
  };
}
