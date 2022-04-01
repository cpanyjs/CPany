import type { IHandle } from './dist/index.d';

export interface INowcoderMeta {
  nowcoder: {
    name: string;
    rating?: number;
    rank?: number;
  };
}

export type IHandleWithNowcoder = IHandle & INowcoderMeta;
