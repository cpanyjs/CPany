import path from 'path';
import { promises } from 'fs';
import { load } from 'js-yaml';

import {
  IContest,
  ICPanyConfig,
  IUser,
  IHandle,
  IContestOverview,
  IUserOverview,
  RouteKey,
  Verdict,
  IProblem
} from '@cpany/types';
import type { IPluginOption } from './types';
import { slash } from './utils';
import {
  DefaultRecentContestsCount,
  DefaultRecentTime,
  DefaultRecentUserCount
} from './constant';

export async function createEnvLoader({ dataRootPath }: IPluginOption) {
  const envMap: Map<string, string> = new Map();
  const load = async () => {
    try {
      const content = (
        await promises.readFile(path.join(dataRootPath, '.env'), 'utf8')
      ).split('\n');
      for (const _line of content) {
        const line = _line.trim();
        if (line === '') continue;
        const [key, value] = line
          .split('=')
          .map((s) => s.trim())
          .filter((s) => s !== '');
        console.log(key, value);

        envMap.set(key, value);
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  await load();
  const ActionVersion = envMap.get('ACTION_VERSION') ?? 'Unknown';
  const UpdateTime = envMap.get('UPDATE_TIME') ?? '';
  process.env.VITE_ACTION_VERSION = ActionVersion;
  process.env.VITE_UPDATE_TIME = UpdateTime;
  return {
    ActionVersion,
    UpdateTime
  };
}

export async function createLoader({
  dataRootPath,
  cliVersion,
  configPath = 'cpany.yml'
}: IPluginOption) {
  const config = load(
    await promises.readFile(path.join(dataRootPath, configPath), 'utf8')
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
      const fullPath = slash(path.resolve(dataRootPath, contestPath));
      const isStatic = (() => {
        for (const staticPath of config.static ?? []) {
          if (
            fullPath.startsWith(slash(path.resolve(dataRootPath, staticPath)))
          ) {
            return true;
          }
        }
        return false;
      })();

      for await (const contest of listAllFiles<IContest>(fullPath)) {
        if (isStatic) {
          // Dep: inline static contest pages
          contest.inlinePage = true;
        }
        contests.push(contest);
      }
    }
    return genRouteKey(
      'contest',
      contests,
      (lhs, rhs) => lhs.startTime - rhs.startTime
    );
  })();

  const { findHandle } = createHandleSet(handles);
  const { findCodeforces } = createCodeforcesSet(contests);

  const users: IUser[] = [];
  const userMap: Map<string, IUser> = new Map();
  const configUser = config?.users ?? {};
  for (const userName in configUser) {
    const user: IUser = {
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

                    // Dep: codeforces fix gym startTime
                    if (!contest.startTime) {
                      contest.startTime = submission.author.participantTime;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    users.push(user);
    userMap.set(user.name, user);
  }

  // Use username to push contest
  for (const contest of contests) {
    for (const standing of contest.standings ?? []) {
      for (const member of standing.author.members) {
        const user = userMap.get(member);
        if (user !== null && user !== undefined) {
          contest.participantNumber++;
          user.contests.push({
            author: standing.author,
            ...contest
          });
        }
      }
    }
  }

  // Desc sort
  for (const user of users) {
    user.contests = user.contests.sort(
      (lhs, rhs) => rhs.author.participantTime - lhs.author.participantTime
    );
  }

  const filterContestEmptyPrefix = (contests: RouteKey<IContest>[]) => {
    const sorted = contests.sort(
      (lhs: IContest, rhs: IContest) => lhs.startTime - rhs.startTime
    );
    let deleteCount = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].participantNumber === 0) {
        deleteCount++;
      } else {
        break;
      }
    }
    sorted.splice(0, deleteCount);
    return sorted.reverse();
  };

  // Dep: skip codeforces gym when gen overview
  const contestsFilterGym = filterContestEmptyPrefix(
    contests.filter(
      (contest) =>
        !contest.type.startsWith('codeforces/gym') ||
        contest.participantNumber > 0
    )
  );

  const createContestsOverview = (
    _length?: number,
    _contests = contestsFilterGym
  ): IContestOverview[] => {
    const length = _length === undefined ? _contests.length : _length;
    const overview: IContestOverview[] = [];
    for (let i = 0; i < length && i < _contests.length; i++) {
      const contest = { ..._contests[i] };
      Reflect.deleteProperty(contest, 'standings');
      overview.push(contest);
    }
    return overview;
  };

  // recentTime = -1: get all sub
  const createUsersOverview = (recentTime: number) => {
    const recentStartTime =
      recentTime >= 0 ? new Date().getTime() / 1000 - recentTime : 0;
    const overview = (user: IUser): IUserOverview => {
      const submissions: IUserOverview['submissions'] = [];

      const solved: Map<string, typeof submissions[number]> = new Map();
      const solve = (problem: IProblem, sub: typeof submissions[number]) => {
        const id = `${problem.type}:${problem.id}`;
        const pre = solved.get(id);
        if (pre === undefined) {
          solved.set(id, sub);
        } else {
          if (pre.t <= sub.t) {
            // pre solve first
            sub.v = -1;
          } else {
            // sub solve first
            pre.v = -1;
            solved.set(id, sub);
          }
        }
      };

      for (const handle of user.handles) {
        for (const sub of handle.submissions) {
          if (sub.creationTime >= recentStartTime) {
            const zipped = {
              type: sub.type,
              t: sub.creationTime,
              v: sub.verdict === Verdict.OK ? 1 : 0,
              d: sub.problem.rating
            };
            if (zipped.v === 1) {
              solve(sub.problem, zipped);
            }
            submissions.push(zipped);
          }
        }
      }

      return {
        name: user.name,
        contests: user.contests.map(({ type, author }) => ({
          type,
          t: author.participantTime
        })),
        handles: user.handles.map((rawHandle) => {
          const handle = { ...rawHandle };
          Reflect.deleteProperty(handle, 'submissions');
          return handle;
        }),
        submissions: submissions.sort((lhs, rhs) => lhs.t - rhs.t)
      };
    };
    return users.map(overview);
  };

  // Dep: app overview.ts
  const createOverview = () => {
    const overviewMap: Map<string, string> = new Map();
    overviewMap.set('title', '`' + (config.app?.title ?? '') + '`');
    overviewMap.set(
      'recentTime',
      '' + config.app?.recentTime ?? DefaultRecentTime
    );
    overviewMap.set(
      'recentContestsCount',
      '' + config.app?.recentContestsCount ?? DefaultRecentContestsCount
    );
    overviewMap.set(
      'recentUserCount',
      '' + config.app?.recentUserCount ?? DefaultRecentUserCount
    );
    overviewMap.set('cliVersion', '`' + cliVersion + '`');

    const allSubmissionCount = users.reduce(
      (sum, user) =>
        sum +
        user.handles.reduce(
          (sum, handle) => sum + handle.submissions.length,
          0
        ),
      0
    );
    overviewMap.set('allSubmissionCount', '' + allSubmissionCount);

    const allOkSubmissionCount = users.reduce(
      (sum, user) =>
        sum +
        user.handles.reduce(
          (sum, handle) =>
            sum +
            handle.submissions.filter((sub) => sub.verdict === Verdict.OK)
              .length,
          0
        ),
      0
    );
    overviewMap.set('allOkSubmissionCount', '' + allOkSubmissionCount);

    const allContestCount = users.reduce(
      (sum, user) => sum + user.contests.length,
      0
    );
    overviewMap.set('allContestCount', '' + allContestCount);

    return overviewMap;
  };

  return {
    config,
    handles,
    allContests: filterContestEmptyPrefix(contests),
    contests: contestsFilterGym,
    users,
    createContestsOverview,
    createUsersOverview,
    createOverview
  };
}

async function* listAllFiles<T>(dir: string): AsyncGenerator<T> {
  if (dir.endsWith('.json')) {
    const files: T | T[] = JSON.parse(await promises.readFile(dir, 'utf8'));
    if (Array.isArray(files)) {
      for (const contest of files) {
        yield contest;
      }
    } else {
      yield files;
    }
  } else {
    const dirents = await promises.readdir(dir, { withFileTypes: true });
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

    // Dep: try use T.id as key
    const keys = sorted.map((contest) => {
      if ('id' in contest && typeof contest.id === 'number') {
        return contest.id;
      } else {
        return null;
      }
    });
    const flag =
      keys.every((key) => key !== null) && new Set(keys).size === keys.length;

    const typeFirst = type.split('/')[0];
    for (let i = 0; i < sorted.length; i++) {
      const key = flag ? keys[i] : i + 1;
      files.push({
        key,
        path: `/${base}/${typeFirst}/${key}`,
        ...sorted[i]
      } as RouteKey<T>);
    }
  }
  // Desc sort
  return files.sort(sortFn).reverse();
}

function createHandleSet(handles: RouteKey<IHandle>[]) {
  const mapByType: Map<string, Map<string, RouteKey<IHandle>>> = new Map();

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

  return {
    findHandle
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
