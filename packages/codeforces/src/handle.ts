import type { AxiosInstance } from 'axios';

import type { ITransformPlugin } from '@cpany/core';
import type { HandleDTO, SubmissionDTO } from '@cpany/types/codeforces';

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
          } = await api.get<{ result: SubmissionDTO[] }>('user.status', {
            params: {
              handle: id
            }
          });
          return result.map((submission: SubmissionDTO) => {
            const submissionUrl =
              submission.contestId >= 100001
                ? `http://codeforces.com/gym/${submission.contestId}/submission/${submission.id}`
                : `http://codeforces.com/contest/${submission.contestId}/submission/${submission.id}`;
            return {
              id: submission.id,
              contestId: submission.contestId,
              creationTimeSeconds: submission.creationTimeSeconds,
              relativeTimeSeconds: submission.relativeTimeSeconds,
              language: submission.programmingLanguage,
              verdict: submission.verdict,
              author: {
                members: submission.author.members.map(({ handle }) => handle),
                participantType: submission.author.participantType,
                teamName: submission.author.teamName
              },
              problem: {
                contestId: submission.problem.contestId,
                index: submission.problem.index,
                name: submission.problem.name,
                rating: submission.problem.rating,
                tags: submission.problem.tags
              },
              submissionUrl
            };
          });
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
