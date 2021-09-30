import type { IHandle } from './dist/index.d';

export interface IAtCoderMeta {
  atcoder: {
    rank?: number;
  };
}

export type IHandleWithAtCoder = IHandle & IAtCoderMeta;
