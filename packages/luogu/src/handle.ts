import { IPlugin } from '@cpany/core';
import { ISubmission, Verdict, ParticipantType } from '@cpany/types';
import type {
  IHandleWithLuogu,
  UserDataDto,
  RecordListDto
} from '@cpany/types/luogu';

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
    async transform({ id, type }, { logger }) {
      if (type === name) {
        const user = await fetchUser(api, id);
        try {
          user.submissions = await fetchSubmissions(api, id);
        } catch (error) {
          logger.error((error as any).message);
        }
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

async function fetchSubmissions(
  api: AxiosInstance,
  id: string
): Promise<ISubmission[]> {
  const { data } = await api.get<RecordListDto>('/record/list', {
    params: { user: id }
  });
  const subs = data.currentData.records.result;
  console.log(subs);

  return subs
    .filter((sub) => sub.problem.type !== 'CF')
    .filter((sub) => sub.status !== 0)
    .map((sub) => {
      return {
        type: 'luogu',
        id: sub.id,
        creationTime: sub.submitTime,
        language: parseLanguage(sub.language),
        verdict: parseVerdict(sub.status),
        author: {
          members: [String(id)],
          participantTime: sub.submitTime,
          participantType: ParticipantType.PRACTICE
        },
        problem: {
          type: 'luogu/' + sub.problem.type,
          id: sub.problem.pid,
          name: sub.problem.title,
          rating: sub.problem.difficulty,
          problemUrl: `https://www.luogu.com.cn/problem/${sub.problem.pid}`
        },
        submissionUrl: `https://www.luogu.com.cn/record/${sub.id}`
      };
    });
}

function parseVerdict(status: number) {
  if (status === 12) return Verdict.OK;
  else if (status === 14) return Verdict.WRONG_ANSWER;
  else if (status === 2) return Verdict.COMPILATION_ERROR;
  return Verdict.FAILED;
}

function parseLanguage(id: number) {
  const list = [
    '',
    'Pascal',
    'C',
    'C++ 98',
    'C++ 11',
    'Python 2',
    'Python 3',
    'Java',
    'Node.js LTS',
    'C++ 14',
    'C++ 17',
    'Ruby',
    'Go',
    'Rust',
    'PHP',
    'C# Mono',
    'Visual Basic Mono',
    'Haskell',
    'Kotlin/native',
    'Kotlin/JVM',
    'Scala',
    'Perl',
    'PyPy 2',
    'PyPy 3',
    '文言'
  ];
  return id < list.length ? list[id] : 'Unknown';
}
