import type { IHandle } from './dist/index.d';

export interface IHduMeta {
  hdu: {
    rank?: number;
  };
}

export type IHandleWithHdu = IHandle & IHduMeta;
