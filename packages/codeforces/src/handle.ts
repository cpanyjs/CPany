import type { AxiosInstance } from 'axios';

import type { QueryPlugin } from '@cpany/core';
import type { ISubmission } from '@cpany/types';
import type { HandleDTO, SubmissionDTO, IHandleWithCodeforces } from '@cpany/types/codeforces';

import { codeforces } from './constant';

export function handleInfoPlugin(api: AxiosInstance): QueryPlugin {
  return {
    name: 'handle',
    platform: codeforces,
    async query(handle: string, { logger }) {
      const fetchInfo = async (): Promise<IHandleWithCodeforces> => {
        const {
          data: {
            result: [data]
          }
        } = await api.get<{ result: HandleDTO[] }>('user.info', {
          params: {
            handles: handle
          }
        });

        const meta =
          !!data.rank && !!data.maxRank
            ? {
                codeforces: {
                  rank: data.rank,
                  rating: data.rating,
                  maxRank: data.maxRank,
                  maxRating: data.maxRating
                }
              }
            : {};

        if (handle !== data.handle) {
          logger.warning(`Warn  : handles are different (${handle} <-> ${data.handle})`);
        }

        return {
          type: codeforces,
          handle: handle,
          handleUrl: `https://codeforces.com/profile/${data.handle}`,
          avatar: data.titlePhoto,
          submissions: [],
          ...meta
        };
      };

      const fetchSubmission = async (): Promise<ISubmission[]> => {
        const {
          data: { result }
        } = await api.get<{ result: SubmissionDTO[] }>('user.status', {
          params: {
            handle: handle
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
              participantTime: submission.creationTimeSeconds - submission.relativeTimeSeconds,
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

      return JSON.stringify(data, null, 2);
    }
  };
}
