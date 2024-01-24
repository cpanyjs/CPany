import fs from 'fs';
import path from 'path';
import debug from 'debug';

import {
  IContest,
  IUser,
  IContestOverview,
  IUserOverview,
  RouteKey,
  Verdict,
  IProblem,
  Key,
  IRouteUser
} from '@cpany/types';

import { listDir } from '../utils';

import type { IPluginOption } from '../types';
import { createCPany } from '../cpany';

const debugLoader = debug('cpany:loader');

export async function createLoader(cliOption: IPluginOption) {
  const { cliVersion, option } = cliOption;
  const cpany = await createCPany(cliOption);

  cpany.on('read', async (...paths: string[]) => {
    const fullPath = path.join(option.dataRoot, ...paths);
    return await fs.promises.readFile(fullPath, 'utf-8');
  });
  cpany.on('list', async (platform: string, ...paths: string[]) => {
    const rootDir = path.join(option.dataRoot, ...paths);
    const files = [];
    for await (const file of listDir(rootDir)) {
      files.push(path.relative(path.join(option.dataRoot, platform), file));
    }
    return files;
  });

  const { handles, contests: rawContests, users: rawUsers } = await cpany.loadAll(option);

  const patchContest = <T extends IContest>(contest: Key<T>) => ({
    ...contest,
    path: `/contest/${contest.type.split('/')[0]}/${contest.key}`
  });
  const contests: RouteKey<IContest>[] = rawContests.map(patchContest).reverse();
  const users: IRouteUser[] = rawUsers.map((user) => ({
    name: user.name,
    key: user.key,
    path: `/user/${user.key}`,
    handles: user.handles,
    contests: user.contests.map(patchContest)
  }));

  debugLoader(`Total: ${handles.length} handles`);
  debugLoader(`Total: ${contests.length} contests`);

  const createContestsOverview = (_length?: number, _contests = contests): IContestOverview[] => {
    const length = _length === undefined ? _contests.length : _length;
    const overview: IContestOverview[] = [];
    for (let i = 0; overview.length < length && i < _contests.length; i++) {
      const contest = { ..._contests[i] };
      if (contest.participantNumber === 0) continue;
      Reflect.deleteProperty(contest, 'standings');
      overview.push(contest);
    }
    return overview;
  };

  // recentTime = -1: get all sub
  const createUsersOverview = (recentTime: number) => {
    const recentStartTime = recentTime >= 0 ? new Date().getTime() / 1000 - recentTime : 0;
    const overview = (user: IUser): IUserOverview => {
      const submissions: IUserOverview['submissions'] = [];

      const solved: Map<string, (typeof submissions)[number]> = new Map();
      const solve = (problem: IProblem, sub: (typeof submissions)[number]) => {
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
    overviewMap.set('title', '`' + option.app.title + '`');
    overviewMap.set('recentTime', String(option.app.recentTime));
    overviewMap.set('recentContestsCount', String(option.app.recentContestsCount));
    overviewMap.set('recentUserCount', String(option.app.recentUserCount));
    overviewMap.set('cliVersion', '`' + cliVersion + '`');
    if (Array.isArray(option.app.nav)) {
      overviewMap.set('nav', `[${option.app.nav.map((t) => `"${t}"`).join(', ')}]`);
    }

    const allSubmissionCount = users.reduce(
      (sum, user) => sum + user.handles.reduce((sum, handle) => sum + handle.submissions.length, 0),
      0
    );
    overviewMap.set('allSubmissionCount', String(allSubmissionCount));

    const allOkSubmissionCount = users.reduce(
      (sum, user) =>
        sum +
        user.handles.reduce(
          (sum, handle) =>
            sum + handle.submissions.filter((sub) => sub.verdict === Verdict.OK).length,
          0
        ),
      0
    );
    overviewMap.set('allOkSubmissionCount', String(allOkSubmissionCount));

    const allContestCount = users.reduce((sum, user) => sum + user.contests.length, 0);
    overviewMap.set('allContestCount', String(allContestCount));

    return overviewMap;
  };

  return {
    handles,
    allContests: contests,
    contests,
    users,
    createContestsOverview,
    createUsersOverview,
    createOverview
  };
}
