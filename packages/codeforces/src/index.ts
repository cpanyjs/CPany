import axios, { AxiosInstance } from 'axios';

import { ILoadPlugin, IPlugin, ITransformPlugin } from '@cpany/core';

interface ICodeforcesPluginOption {
  baseUrl?: string;
  timeout?: number;
}

export function codeforcesPlugin(
  option: ICodeforcesPluginOption = {}
): IPlugin[] {
  const api = axios.create({
    baseURL: option.baseUrl ?? 'https://codeforces.com/api/',
    timeout: option.timeout ?? 30 * 1000
  });

  return [contestList(api), userInfoPlugin(api)];
}

function contestList(api: AxiosInstance): ILoadPlugin {
  const name = 'codeforces/contest';
  return {
    name,
    async load(id) {
      if (id === name) {
        const {
          data: { result }
        } = await api.get('contest.list');
        return JSON.stringify(result, null, 2);
      }
    }
  };
}

function userInfoPlugin(api: AxiosInstance): ITransformPlugin {
  const name = 'codeforces/handle';
  return {
    name,
    resolveKey({ id, type }) {
      if (type === name) {
        return name + '/' + id;
      }
    },
    async transform({ id, type }) {
      if (type === name) {
        const {
          data: {
            result: [data]
          }
        } = await api.get('user.info', {
          params: {
            handles: id
          }
        });
        return {
          key: name + '/' + id,
          content: JSON.stringify(data, null, 2)
        };
      }
    }
  };
}
