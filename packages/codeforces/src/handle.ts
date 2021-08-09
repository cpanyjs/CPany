import type { AxiosInstance } from 'axios';

import { ITransformPlugin } from '@cpany/core';
import type { HandleDTO, SubmissionDTO } from './type';

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
        const fetchInfo = async () => {
          const {
            data: {
              result: [data]
            }
          } = await api.get<{ result: HandleDTO[] }>('user.info', {
            params: {
              handles: id
            }
          });
          return {
            handle: data.handle,
            avatar: data.titlePhoto,
            codeforces: {
              rank: data.rank,
              rating: data.rating,
              maxRank: data.maxRank,
              maxRating: data.maxRating,
              submissions: [] as any[]
            }
          };
        };

        const fetchSubmission = async () => {
          const {
            data: { result }
          } = await api.get('user.status', {
            params: {
              handle: id
            }
          });
          return result as SubmissionDTO[];
        };

        const data = await fetchInfo();
        data.codeforces.submissions = await fetchSubmission();

        return {
          key: gid(id),
          content: JSON.stringify(data, null, 2)
        };
      }
    }
  };
}
