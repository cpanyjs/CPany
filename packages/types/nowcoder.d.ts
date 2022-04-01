import type { IHandle } from './dist/index.d';

export interface INowcoderMeta {
  atcoder: {
    rating?: number;
    color?: string;
  };
}

export type IHandleWithNowcoder = IHandle & INowcoderMeta;
