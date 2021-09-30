import type { IHandle } from './dist/index.d';

export interface IAtCoderMeta {
  atcoder: {
    rank?: number;
    rating?: number;
    maxRating?: number;
    color?: string;
  };
}

export type IHandleWithAtCoder = IHandle & IAtCoderMeta;
