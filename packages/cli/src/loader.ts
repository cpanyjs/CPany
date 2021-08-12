import path from 'path';
import { readFile, readdir } from 'fs/promises';
import { load } from 'js-yaml';

import {
  IContest,
  ICPanyConfig,
  ICPanyUser,
  IHandle,
  ParticipantType,
  RouteKey
} from '@cpany/types';
import type { IPluginOption } from './types';

export async function createLoader({
  dataRootPath,
  configPath = 'cpany.yml'
}: IPluginOption) {
  const config = load(
    await readFile(path.join(dataRootPath, configPath), 'utf8')
  ) as ICPanyConfig;

  const handles = await (async () => {
    const handles: IHandle[] = [];
    for (const handlePath of config.handles ?? []) {
      const fullPath = path.resolve(dataRootPath, handlePath);
      for await (const handle of listAllFiles<IHandle>(fullPath)) {
        handles.push(handle);
      }
    }
    return genRouteKey('handle', handles);
  })();

  const contests = await (async () => {
    const contests: IContest[] = [];
    for (const contestPath of config.contests ?? []) {
      const fullPath = path.resolve(dataRootPath, contestPath);
      for await (const contest of listAllFiles<IContest>(fullPath)) {
        contests.push(contest);
      }
    }
    return genRouteKey(
      'contest',
      contests,
      (lhs, rhs) => lhs.startTime - rhs.startTime
    );
  })();

  const { findHandle, linkHandle, findUser } = createHandleSet(handles);
  const { findCodeforces } = createCodeforcesSet(contests);

  const users: ICPanyUser[] = [];
  const configUser = config?.users ?? {};
  for (const userName in configUser) {
    const user: ICPanyUser = {
      name: userName,
      handles: [],
      contests: []
    };

    const cfRoundSet: Set<number> = new Set();
    for (const type in configUser[userName]) {
      const rawHandles = configUser[userName][type];
      const thisHandles =
        typeof rawHandles === 'string' ? [rawHandles] : rawHandles;

      for (const handleName of thisHandles) {
        const handle = findHandle(type, handleName);

        if (handle !== null) {
          user.handles.push(handle);
          linkHandle(handle, user);

          // Dep: find codeforces contests
          if (handle.type.startsWith('codeforces')) {
            for (const submission of handle.submissions) {
              if (
                submission.author.participantType === 'CONTESTANT' ||
                submission.author.participantType === 'VIRTUAL'
              ) {
                const contestId = +/^(\d+)/.exec(
                  '' + submission.problem.id
                )![1];
                if (!cfRoundSet.has(contestId)) {
                  const contest = findCodeforces(contestId);
                  if (contest !== null) {
                    // Add field participantType
                    user.contests.push({
                      author: submission.author,
                      ...contest
                    });
                    contest.participantNumber++;
                    cfRoundSet.add(contestId);
                  }
                }
              }
            }
          }
        }
      }
    }

    users.push(user);
  }

  for (const contest of contests) {
    for (const standing of contest.standings ?? []) {
      for (const member of standing.author.members) {
        const user = findUser(contest.type, member);
        if (user !== null) {
          contest.participantNumber++;
          user.contests.push({
            author: {
              members: [],
              participantType: ParticipantType.CONTESTANT
            },
            ...contest
          });
        }
      }
    }
  }

  // Remove duplicate contests and sort
  for (const user of users) {
    user.contests = [...new Set(user.contests)].sort(
      (lhs, rhs) => rhs.startTime - lhs.startTime
    );
  }

  return {
    handles,
    // Dep: skip codeforces gym
    contests: contests.filter(
      (contest) => !contest.type.startsWith('codeforces/gym')
    ),
    users
  };
}

async function* listAllFiles<T>(dir: string): AsyncGenerator<T> {
  if (dir.endsWith('.json')) {
    const files: T | T[] = JSON.parse(await readFile(dir, 'utf8'));
    if (Array.isArray(files)) {
      for (const contest of files) {
        yield contest;
      }
    } else {
      yield files;
    }
  } else {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const id = path.join(dir, dirent.name);
      yield* listAllFiles(id);
    }
  }
}

function genRouteKey<T extends IContest | IHandle>(
  base: string,
  rawFiles: T[],
  sortFn?: (lhs: T, rhs: T) => number
) {
  const mapByType: Map<string, T[]> = new Map();
  for (const file of rawFiles) {
    if (mapByType.has(file.type)) {
      mapByType.get(file.type)!.push(file);
    } else {
      mapByType.set(file.type, [file]);
    }
  }
  const files: Array<RouteKey<T>> = [];
  for (const [type, rawFiles] of mapByType.entries()) {
    const sorted = rawFiles.sort(sortFn);
    mapByType.set(type, sorted);
    for (let i = 0; i < sorted.length; i++) {
      files.push({
        key: i + 1,
        path: `/${base}/${type}/${i + 1}`,
        ...sorted[i]
      } as RouteKey<T>);
    }
  }
  return files;
}

function createHandleSet(handles: RouteKey<IHandle>[]) {
  const mapByType: Map<string, Map<string, RouteKey<IHandle>>> = new Map();

  const handleToUser: WeakMap<IHandle, ICPanyUser> = new WeakMap();

  for (const handle of handles) {
    if (mapByType.has(handle.type)) {
      mapByType.get(handle.type)!.set(handle.handle, handle);
    } else {
      const map: Map<string, RouteKey<IHandle>> = new Map();
      map.set(handle.handle, handle);
      mapByType.set(handle.type, map);
    }
  }

  const findHandle = (type: string, handle: string) => {
    if (mapByType.has(type)) {
      const map = mapByType.get(type)!;
      if (map.has(handle)) {
        return map.get(handle)!;
      } else {
        return null;
      }
    } else {
      return null;
    }
  };

  const linkHandle = (handle: IHandle, user: ICPanyUser) => {
    handleToUser.set(handle, user);
  };

  const findUser = (type: string, handle: string) => {
    const item = findHandle(type, handle);
    if (item !== null) {
      return handleToUser.get(item) ?? null;
    } else {
      return null;
    }
  };

  return {
    findHandle,
    linkHandle,
    findUser
  };
}

function createCodeforcesSet(contests: RouteKey<IContest>[]) {
  const map: Map<number, RouteKey<IContest>> = new Map();
  for (const contest of contests) {
    if (contest.type.startsWith('codeforces')) {
      map.set(contest.id as number, contest);
    }
  }

  const findCodeforces = (id: number | string) => {
    return map.get(+id) ?? null;
  };
  return { findCodeforces };
}
