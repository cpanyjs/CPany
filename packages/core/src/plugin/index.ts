import type {
  CPanyPlugin,
  CachePlugin,
  FetchPlugin,
  QueryPlugin,
  FetchResult,
  FetchContext
} from './fetch';

export type { CPanyPlugin, CachePlugin, FetchPlugin, QueryPlugin, FetchResult, FetchContext };

export function isCachePlugin(plugin: CPanyPlugin): plugin is CachePlugin {
  return 'cache' in plugin;
}

export function isFetchPlugin(plugin: CPanyPlugin): plugin is FetchPlugin {
  return 'fetch' in plugin;
}

export function isQueryPlugin(plugin: CPanyPlugin): plugin is QueryPlugin {
  return 'query' in plugin;
}

export function createPluginContainer(
  plugins?: Array<CPanyPlugin | CPanyPlugin[] | null | undefined>
): PluginContainer {
  const allPlugins = [];
  const map = new Map<string, CPanyPlugin[]>();
  for (const plugin of (plugins ?? []).flat()) {
    if (!!plugin) {
      const platform = plugin.platform;
      if (!map.has(platform)) {
        map.set(platform, []);
      }
      map.get(platform)!!.push(plugin);
      allPlugins.push(plugin);
    }
  }
  const all = classify(allPlugins);
  const container: Record<string, ClassifiedPlugins> = {};
  for (const [platform, plugins] of map) {
    container[platform] = classify(plugins);
  }

  return {
    plugins: sortPlugins(allPlugins),
    platforms: [...map.keys()],
    cache: () => all.cache,
    fetch(platform?: string) {
      if (!!platform) {
        return container[platform]?.fetch ?? [];
      } else {
        return all.fetch;
      }
    },
    allQuery: () => all.query,
    query(platform: string, name: string) {
      const plugins = container[platform]?.query ?? [];
      for (const plugin of plugins) {
        if (plugin.name === name) {
          return plugin;
        }
      }
      return undefined;
    }
  };
}

function classify(plugins: CPanyPlugin[]): ClassifiedPlugins {
  const cache: CachePlugin[] = [];
  const fetch: FetchPlugin[] = [];
  const query: QueryPlugin[] = [];

  for (const plugin of plugins) {
    if (!plugin) continue;
    if (isCachePlugin(plugin)) {
      cache.push(plugin);
    }
    if (isFetchPlugin(plugin)) {
      fetch.push(plugin);
    }
    if (isQueryPlugin(plugin)) {
      query.push(plugin);
    }
  }

  return {
    cache,
    fetch,
    query
  };
}

export function sortPlugins(plugins: CPanyPlugin[]) {
  return plugins.sort((lhs, rhs) => {
    const gid = (plugin: CPanyPlugin) => {
      if (!!plugin.enforce) {
        if (isCachePlugin(plugin)) {
          return -2;
        }
      } else if (plugin.enforce === 'pre') {
        return -1;
      } else if (plugin.enforce === 'post') {
        return 1;
      }
      return 0;
    };
    const cmp = gid(lhs) - gid(rhs);
    if (cmp !== 0) {
      return cmp;
    } else {
      const cmp = lhs.platform.localeCompare(rhs.platform);
      if (cmp !== 0) {
        return cmp;
      } else {
        return lhs.name.localeCompare(rhs.name);
      }
    }
  });
}

interface PluginContainer {
  /**
   * All CPany plugins, sorted by enforce, platform, name
   */
  plugins: CPanyPlugin[];

  platforms: string[];

  cache(): CachePlugin[];

  fetch(platform?: string): FetchPlugin[];

  allQuery(): QueryPlugin[];

  query(platform: string, name: string): QueryPlugin | undefined;
}

interface ClassifiedPlugins {
  cache: CachePlugin[];
  fetch: FetchPlugin[];
  query: QueryPlugin[];
}
