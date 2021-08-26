import type { IPlugin } from '@cpany/core';
import type { IHandleWithHdu } from '@cpany/types/hdu';
import axios from 'axios';

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
    async transform({ id, type }) {
      if (type === name) {
        const handle = await fetchHandle(id);
        return {
          key: gid(id),
          content: JSON.stringify(handle, null, 2)
        };
      }
      return null;
    }
  };
}

export async function fetchHandle(handle: string): Promise<IHandleWithHdu> {
  const { data } = await axios.get(
    `https://acm.hdu.edu.cn/userstatus.php?user=${handle}`
  );
  const rank = /<tr><td>Rank<\/td><td align=center>(\d+)<\/td><\/tr>/.exec(
    data
  );
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
