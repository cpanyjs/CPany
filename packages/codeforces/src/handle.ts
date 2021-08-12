import type { AxiosInstance } from 'axios';

import type { ITransformPlugin } from '@cpany/core';
import type { ISubmission } from '@cpany/types';
import type {
  HandleDTO,
  SubmissionDTO,
  IHandleWithCodeforces
} from '@cpany/types/codeforces';

import { codeforces } from './constant';

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
        const fetchInfo = async (): Promise<IHandleWithCodeforces> => {
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
            type: name,
            handle: data.handle,
            avatar: data.titlePhoto,
            codeforces: {
              rank: data.rank,
              rating: data.rating,
              maxRank: data.maxRank,
              maxRating: data.maxRating
            },
            submissions: []
          };
        };

        const fetchSubmission = async (): Promise<ISubmission[]> => {
          const {
            data: { result }
          } = await api.get<{ result: SubmissionDTO[] }>('user.status', {
            params: {
              handle: id
            }
          });

          return result.map((submission: SubmissionDTO): ISubmission => {
            const prefix =
              (submission.contestId >= 100001
                ? 'https://codeforces.com/gym/'
                : 'https://codeforces.com/contest/') + submission.contestId;

            const submissionUrl = prefix + `/submission/${submission.id}`;

            const problemUrl = prefix + `/problem/${submission.problem.index}`;

            return {
              type: codeforces,
              id: submission.id,
              creationTime: submission.creationTimeSeconds,
              language: submission.programmingLanguage,
              verdict: submission.verdict,
              author: {
                members: submission.author.members.map(({ handle }) => handle),
                participantType: submission.author.participantType,
                teamName: submission.author.teamName
              },
              problem: {
                type: codeforces,
                id: `${submission.problem.contestId}${submission.problem.index}`,
                name: submission.problem.name,
                rating: submission.problem.rating,
                tags: submission.problem.tags,
                problemUrl
              },
              submissionUrl
            };
          });
        };

        const data = await fetchInfo();
        data.submissions = await fetchSubmission();

        return {
          key: gid(id),
          content: JSON.stringify(data, null, 2)
        };
      }
    }
  };
}
