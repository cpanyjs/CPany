import type { AxiosInstance } from 'axios';

import { ITransformPlugin } from '@cpany/core';

export function handleInfoPlugin(api: AxiosInstance): ITransformPlugin {
  const name = 'codeforces/handle';
  const gid = (id: string) => name + '/' + id + '.json';
  return {
    name,
    resolveKey({ id, type }) {
      if (type === name) {
        return gid(id);
      }
    },
    async transform({ id, type }) {
      if (type === name) {
        const {
          data: {
            result: [data]
          }
        } = await api.get('user.info', {
          params: {
            handles: id
          }
        });
        return {
          key: gid(id),
          content: JSON.stringify(data, null, 2)
        };
      }
    }
  };
}
