import type { IHandle } from '../handle';

export * from './raw';

export interface ICodeforcesMeta {
  codeforces: {
    rank: string;
    rating: number;
    maxRank: string;
    maxRating: number;
  };
}

export type IHandleWithCodeforces = IHandle & ICodeforcesMeta;
