import { CPanyOption, ResolvedCPanyOption, ResolvedCPanyUserOption } from '@cpany/types';
import {
  DefaultNav,
  DefaultRecentContestsCount,
  DefaultRecentTime,
  DefaultRecentUserCount
} from './constant';

export function resolveCPanyOption(dataRoot: string, rawOption: CPanyOption): ResolvedCPanyOption {
  const users = [];

  for (const username in rawOption.users) {
    const rawUser = rawOption.users[username];
    const user: ResolvedCPanyUserOption = {
      name: username,
      handle: []
    };
    users.push(user);

    for (const rawKey in rawUser) {
      const rawHandles = rawUser[rawKey];
      const splitKey = rawKey.split('/');
      if (splitKey.length === 2) {
        const key = splitKey[0];
        const platform = splitKey[1];

        // TODO: more general
        if (key in user && key === 'handle') {
          // user.<name>.handle/<platform>
          if (Array.isArray(rawHandles) || typeof rawHandles === 'string') {
            const handles = typeof rawHandles === 'string' ? [rawHandles] : rawHandles;
            for (const handle of handles) {
              user[key].push({ platform, handle });
            }
          } else {
            throw new Error(`Invalid nest structure: ${rawKey}`);
          }
        } else {
          throw new Error(`Invalid nest key: ${rawKey}`);
        }
      } else if (splitKey.length === 1) {
        const key = splitKey[0];

        if (key === 'handle') {
          // user.<name>.handle.<platform>
          if (typeof rawHandles === 'object' && !Array.isArray(rawHandles)) {
            for (const platform in rawHandles) {
              const _handles = rawHandles[platform];
              const handles = typeof _handles === 'string' ? [_handles] : _handles;
              for (const handle of handles) {
                user[key].push({ platform, handle });
              }
            }
          } else {
            // Unsupport
          }
        } else {
          // Unsupport
        }
      } else {
        throw new Error(`Invalid nest key: ${rawKey}`);
      }
    }
  }

  return {
    dataRoot,
    users,
    static: {
      handles: rawOption.handles ?? [],
      contests: rawOption.contests ?? [],
      blogs: []
    },
    app: {
      title: rawOption.app?.title ?? '',
      recentTime: rawOption.app?.recentTime ?? DefaultRecentTime,
      recentContestsCount: rawOption.app?.recentContestsCount ?? DefaultRecentContestsCount,
      recentUserCount: rawOption.app?.recentUserCount ?? DefaultRecentUserCount,
      nav: rawOption.app?.nav ?? DefaultNav
    }
  };
}
